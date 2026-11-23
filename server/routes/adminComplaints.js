import express from 'express';
import mongoose from 'mongoose';
import { Complaint, ALLOWED_STATUSES, VALID_STATUS_TRANSITIONS } from '../models/Complaint.js';
import { Admin } from '../models/Admin.js';
import { Student } from '../models/Student.js';
import { requireAdminAuth } from '../middleware/auth.js';
import { verifyCsrfToken } from '../middleware/csrf.js';
import { validateObjectId } from '../middleware/validate.js';
import { streamComplaintAttachment } from '../controllers/attachmentController.js';
import { hashPassword } from '../utils/crypto.js';

const router = express.Router();

// Enforce admin session authentication across all routes in this file
router.use(requireAdminAuth);

/**
 * Helper to build query filter from request query parameters.
 */
function buildComplaintFilter(query, currentAdminId) {
  const filter = {};
  const now = new Date();

  // Tab Quick Filters
  if (query.tab) {
    const tab = String(query.tab).toLowerCase();
    if (tab === 'unassigned') {
      filter.assignedTo = null;
      filter.status = { $ne: 'Resolved' };
    } else if (tab === 'urgent') {
      filter.priority = { $in: ['Urgent', 'High'] };
      filter.status = { $ne: 'Resolved' };
    } else if (tab === 'overdue') {
      filter.slaDueAt = { $lt: now };
      filter.status = { $ne: 'Resolved' };
    } else if (tab === 'mine' && currentAdminId) {
      filter.assignedTo = currentAdminId;
    }
  }

  // Status Filter
  if (query.status && query.status !== 'All' && ALLOWED_STATUSES.includes(query.status)) {
    filter.status = query.status;
  }

  // Category Filter
  if (query.category && query.category !== 'All' && typeof query.category === 'string') {
    filter.category = query.category.trim();
  }

  // Priority Filter
  if (query.priority && query.priority !== 'All' && typeof query.priority === 'string') {
    filter.priority = query.priority.trim();
  }

  // Technician / Assignment Filter
  if (query.technician && query.technician !== 'all') {
    if (query.technician === 'unassigned') {
      filter.assignedTo = null;
    } else if (mongoose.isValidObjectId(query.technician)) {
      filter.assignedTo = new mongoose.Types.ObjectId(query.technician);
    }
  }

  // SLA State Filter
  if (query.slaState && query.slaState !== 'all') {
    if (query.slaState === 'breached') {
      filter.slaDueAt = { $lt: now };
      filter.status = { $ne: 'Resolved' };
    } else if (query.slaState === 'dueSoon') {
      filter.slaDueAt = {
        $gte: now,
        $lte: new Date(now.getTime() + 6 * 3600 * 1000),
      };
      filter.status = { $ne: 'Resolved' };
    } else if (query.slaState === 'healthy') {
      filter.slaDueAt = { $gt: new Date(now.getTime() + 6 * 3600 * 1000) };
    }
  }

  // Date Range Filter
  if (query.startDate || query.endDate) {
    filter.createdAt = filter.createdAt || {};
    if (query.startDate) {
      const start = new Date(query.startDate);
      if (!isNaN(start.getTime())) filter.createdAt.$gte = start;
    }
    if (query.endDate) {
      const end = new Date(query.endDate);
      if (!isNaN(end.getTime())) {
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }
  }

  // Keyword Search
  if (query.search && typeof query.search === 'string') {
    const searchStr = query.search.trim();
    if (searchStr) {
      filter.$or = [
        { reference: { $regex: searchStr, $options: 'i' } },
        { referenceId: { $regex: searchStr, $options: 'i' } },
        { title: { $regex: searchStr, $options: 'i' } },
        { 'student.name': { $regex: searchStr, $options: 'i' } },
        { 'student.studentId': { $regex: searchStr, $options: 'i' } },
        { 'student.email': { $regex: searchStr, $options: 'i' } },
        { description: { $regex: searchStr, $options: 'i' } },
      ];
    }
  }

  return filter;
}

/**
 * GET /api/v1/admin/complaints
 * Returns paginated, searchable, sorted, and filterable complaint records.
 */
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '15', 10)));
    const skip = (page - 1) * limit;

    const filter = buildComplaintFilter(req.query, req.admin?._id);

    // Sorting
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sortOptions = {};

    if (sortBy === 'priority') {
      // Priority sorting fallback
      sortOptions.priority = sortOrder;
    } else if (['slaDueAt', 'status', 'title', 'createdAt'].includes(sortBy)) {
      sortOptions[sortBy] = sortOrder;
    } else {
      sortOptions.createdAt = -1;
    }

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Complaint.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      complaints,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/admin/complaints/export/csv
 * Exports filtered complaints dataset as downloadable CSV.
 */
router.get('/export/csv', async (req, res, next) => {
  try {
    const filter = buildComplaintFilter(req.query, req.admin?._id);
    const complaints = await Complaint.find(filter).sort({ createdAt: -1 }).lean().limit(1000);

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const headers = [
      'Reference ID',
      'Title',
      'Category',
      'Priority',
      'Status',
      'Student Name',
      'Student ID',
      'Assigned Staff',
      'Created At',
      'SLA Due At',
    ];

    const rows = complaints.map((c) => [
      escapeCsv(c.reference || c.referenceId),
      escapeCsv(c.title),
      escapeCsv(c.category),
      escapeCsv(c.priority),
      escapeCsv(c.status),
      escapeCsv(c.student?.name || 'N/A'),
      escapeCsv(c.student?.studentId || 'N/A'),
      escapeCsv(c.assignedStaff?.name || 'Unassigned'),
      escapeCsv(c.createdAt ? new Date(c.createdAt).toISOString() : ''),
      escapeCsv(c.slaDueAt ? new Date(c.slaDueAt).toISOString() : ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="sccs_complaints_export.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/admin/complaints/staff (and /technicians)
 * Returns list of technicians/staff with current active workload count.
 */
router.get(['/staff', '/technicians'], async (req, res, next) => {
  try {
    const staffList = await Admin.find().select('-passwordHash').sort({ name: 1 }).lean();

    // Calculate active complaints workload for each technician
    const workloadAgg = await Complaint.aggregate([
      { $match: { assignedTo: { $ne: null }, status: { $ne: 'Resolved' } } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
    ]);

    const workloadMap = new Map();
    workloadAgg.forEach((w) => workloadMap.set(String(w._id), w.count));

    const enrichedStaff = staffList.map((s) => ({
      ...s,
      activeComplaintsCount: workloadMap.get(String(s._id)) || 0,
    }));

    return res.status(200).json({
      success: true,
      staff: enrichedStaff,
      technicians: enrichedStaff,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/admin/complaints/staff
 * Creates a new technician or staff member.
 */
router.post('/staff', verifyCsrfToken, async (req, res, next) => {
  try {
    const { name, email, password, temporaryPassword, role, title, department, specialization, phone } = req.body || {};
    const effectivePassword = password || temporaryPassword;

    if (!name || !email || !effectivePassword) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_FIELDS',
        message: 'Name, email, and password are required.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await Admin.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({
        success: false,
        code: 'EMAIL_EXISTS',
        message: 'An administrator or technician with this email address already exists.',
      });
    }

    const passwordHash = await hashPassword(effectivePassword);
    const newStaff = await Admin.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: ['Admin', 'Staff', 'Technician'].includes(role) ? role : 'Technician',
      title: title?.trim() || 'IT Support Specialist',
      department: department?.trim() || 'IT Support Desk',
      specialization: specialization?.trim() || 'Hardware & Networking',
      phone: phone?.trim() || '',
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: 'New technician successfully onboarded.',
      staff: newStaff.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/admin/complaints/staff/:id/status
 * Activates or deactivates a technician account.
 */
router.patch('/staff/:id/status', validateObjectId('id'), verifyCsrfToken, async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const staff = await Admin.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Staff member not found.' });
    }

    staff.isActive = Boolean(isActive);
    await staff.save();

    return res.status(200).json({
      success: true,
      message: `Staff account ${staff.isActive ? 'activated' : 'deactivated'}.`,
      staff: staff.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/admin/complaints/students
 * Searchable list of registered students with their complaint counts.
 */
router.get('/students', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.search && typeof req.query.search === 'string') {
      const q = req.query.search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { studentId: { $regex: q, $options: 'i' } },
      ];
    }

    const [students, total] = await Promise.all([
      Student.find(query).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Student.countDocuments(query),
    ]);

    // Aggregate complaints count per student
    const studentIds = students.map((s) => s._id);
    const complaintCounts = await Complaint.aggregate([
      { $match: { studentId: { $in: studentIds } } },
      {
        $group: {
          _id: '$studentId',
          total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
          active: { $sum: { $cond: [{ $ne: ['$status', 'Resolved'] }, 1, 0] } },
        },
      },
    ]);

    const countMap = new Map();
    complaintCounts.forEach((c) => countMap.set(String(c._id), c));

    const enrichedStudents = students.map((s) => {
      const counts = countMap.get(String(s._id)) || { total: 0, resolved: 0, active: 0 };
      return {
        ...s,
        complaintsCount: counts.total,
        resolvedCount: counts.resolved,
        activeCount: counts.active,
      };
    });

    return res.status(200).json({
      success: true,
      students: enrichedStudents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/admin/complaints/bulk/assign
 * Bulk assigns multiple complaints to a technician.
 */
router.post('/bulk/assign', verifyCsrfToken, async (req, res, next) => {
  try {
    const { complaintIds, technicianId } = req.body || {};

    if (!Array.isArray(complaintIds) || complaintIds.length === 0) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_INPUT',
        message: 'complaintIds must be a non-empty array of complaint IDs.',
      });
    }

    let assignedStaff = null;
    let assignedTo = null;

    if (technicianId) {
      if (!mongoose.isValidObjectId(technicianId)) {
        return res.status(400).json({ success: false, code: 'INVALID_TECHNICIAN_ID', message: 'Invalid technician ID.' });
      }
      const tech = await Admin.findById(technicianId);
      if (!tech) {
        return res.status(404).json({ success: false, code: 'TECHNICIAN_NOT_FOUND', message: 'Technician not found.' });
      }
      assignedTo = tech._id;
      assignedStaff = {
        id: tech._id,
        name: tech.name,
        email: tech.email,
        role: tech.role,
      };
    }

    const timestamp = new Date();
    const actionDesc = assignedStaff ? `Assigned to ${assignedStaff.name}` : 'Unassigned';

    const updateResult = await Complaint.updateMany(
      { _id: { $in: complaintIds } },
      {
        $set: { assignedTo, assignedStaff },
        $push: {
          timeline: {
            action: actionDesc,
            note: `Bulk assignment by ${req.admin.name}`,
            performedBy: `${req.admin.name} (Admin)`,
            timestamp,
          },
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: `Successfully updated ${complaintIds.length} complaints.`,
      updatedCount: updateResult.modifiedCount !== undefined ? updateResult.modifiedCount : complaintIds.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/admin/complaints/bulk/status
 * Bulk status update for multiple complaints.
 */
router.post('/bulk/status', verifyCsrfToken, async (req, res, next) => {
  try {
    const { complaintIds, status, note } = req.body || {};

    if (!Array.isArray(complaintIds) || complaintIds.length === 0) {
      return res.status(400).json({ success: false, code: 'INVALID_INPUT', message: 'complaintIds must be a non-empty array.' });
    }

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, code: 'INVALID_STATUS', message: `Status must be one of: ${ALLOWED_STATUSES.join(', ')}` });
    }

    const timestamp = new Date();
    const updateResult = await Complaint.updateMany(
      { _id: { $in: complaintIds } },
      {
        $set: { status },
        $push: {
          statusHistory: {
            status,
            note: note?.trim() || `Bulk transition to ${status}`,
            by: req.admin.name,
            at: timestamp,
          },
          timeline: {
            action: `Status Changed to ${status}`,
            toStatus: status,
            note: note?.trim() || `Bulk transition to ${status}`,
            performedBy: `${req.admin.name} (Admin)`,
            timestamp,
          },
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: `Successfully updated ${complaintIds.length} complaints to "${status}".`,
      updatedCount: updateResult.modifiedCount !== undefined ? updateResult.modifiedCount : complaintIds.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/admin/complaints/:id/assign
 * Assigns or reassigns complaint to a technician.
 */
router.patch('/:id/assign', validateObjectId('id'), verifyCsrfToken, async (req, res, next) => {
  try {
    const { technicianId } = req.body || {};
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Complaint record not found.' });
    }

    if (technicianId) {
      if (!mongoose.isValidObjectId(technicianId)) {
        return res.status(400).json({ success: false, code: 'INVALID_ID', message: 'Invalid technician ID.' });
      }
      const technician = await Admin.findById(technicianId);
      if (!technician || !technician.isActive) {
        return res.status(404).json({ success: false, code: 'TECHNICIAN_NOT_FOUND', message: 'Active technician not found.' });
      }

      complaint.assignedTo = technician._id;
      complaint.assignedStaff = {
        id: technician._id,
        name: technician.name,
        email: technician.email,
        role: technician.role,
      };

      complaint.timeline.push({
        action: `Assigned to ${technician.name}`,
        note: `Technician assigned by ${req.admin.name}`,
        performedBy: `${req.admin.name} (Admin)`,
        timestamp: new Date(),
      });
    } else {
      complaint.assignedTo = null;
      complaint.assignedStaff = null;
      complaint.timeline.push({
        action: 'Unassigned',
        note: `Technician unassigned by ${req.admin.name}`,
        performedBy: `${req.admin.name} (Admin)`,
        timestamp: new Date(),
      });
    }

    await complaint.save();
    return res.status(200).json({ success: true, message: 'Technician assignment updated.', complaint });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/admin/complaints/:id/priority
 * Updates complaint priority.
 */
router.patch('/:id/priority', validateObjectId('id'), verifyCsrfToken, async (req, res, next) => {
  try {
    const { priority } = req.body || {};
    if (!['Low', 'Medium', 'High', 'Urgent'].includes(priority)) {
      return res.status(400).json({ success: false, code: 'INVALID_PRIORITY', message: 'Priority must be Low, Medium, High, or Urgent.' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Complaint record not found.' });
    }

    const oldPriority = complaint.priority;
    complaint.priority = priority;

    complaint.timeline.push({
      action: `Priority Changed to ${priority}`,
      note: `Priority changed from ${oldPriority} to ${priority} by ${req.admin.name}`,
      performedBy: `${req.admin.name} (Admin)`,
      timestamp: new Date(),
    });

    await complaint.save();
    return res.status(200).json({ success: true, message: `Priority updated to ${priority}.`, complaint });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/admin/complaints/:id
 * Retrieves a single complaint by MongoDB ObjectId.
 */
router.get('/:id', validateObjectId('id'), async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        code: 'NOT_FOUND',
        message: 'Complaint record not found.',
      });
    }

    return res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/admin/complaints/:id/status
 * Updates complaint status with validation of permitted transitions and audit logging.
 */
router.patch('/:id/status', validateObjectId('id'), verifyCsrfToken, async (req, res, next) => {
  try {
    const { status, note } = req.body || {};

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_STATUS',
        message: `Status must be one of: ${ALLOWED_STATUSES.join(', ')}`,
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        code: 'NOT_FOUND',
        message: 'Complaint record not found.',
      });
    }

    const currentStatus = complaint.status;
    if (currentStatus === status) {
      return res.status(400).json({
        success: false,
        code: 'STATUS_UNCHANGED',
        message: `Complaint is already in "${status}" status.`,
      });
    }

    // Validate transition
    const validNextStates = VALID_STATUS_TRANSITIONS[currentStatus] || [];
    if (!validNextStates.includes(status)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_TRANSITION',
        message: `Cannot transition status directly from "${currentStatus}" to "${status}". Allowed transitions: ${validNextStates.join(', ')}`,
      });
    }

    const timestamp = new Date();
    complaint.timeline.push({
      action: `Status Changed to ${status}`,
      fromStatus: currentStatus,
      toStatus: status,
      note: note && typeof note === 'string' ? note.trim() : `Status transitioned from ${currentStatus} to ${status}`,
      performedBy: `${req.admin.name} (Admin)`,
      timestamp,
    });

    complaint.statusHistory.push({
      status,
      note: note && typeof note === 'string' ? note.trim() : `Status transitioned from ${currentStatus} to ${status}`,
      by: `${req.admin.name} (Admin)`,
      at: timestamp,
    });

    complaint.status = status;
    await complaint.save();

    return res.status(200).json({
      success: true,
      message: `Status updated to "${status}".`,
      complaint,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/admin/complaints/:id/responses
 * Adds a student-visible official response to the complaint.
 */
router.post('/:id/responses', validateObjectId('id'), verifyCsrfToken, async (req, res, next) => {
  try {
    const { message } = req.body || {};

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_RESPONSE',
        message: 'Response message is required and must be at least 5 characters.',
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        code: 'NOT_FOUND',
        message: 'Complaint record not found.',
      });
    }

    const newResponse = {
      message: message.trim(),
      createdBy: {
        name: req.admin.name,
        email: req.admin.email,
        adminId: req.admin._id,
      },
      createdAt: new Date(),
    };

    complaint.responses.push(newResponse);

    // Append to public timeline
    complaint.timeline.push({
      action: 'Official Response Posted',
      fromStatus: complaint.status,
      toStatus: complaint.status,
      note: `Official response added by ${req.admin.name}`,
      performedBy: `${req.admin.name} (Admin)`,
      timestamp: new Date(),
    });

    await complaint.save();

    return res.status(201).json({
      success: true,
      message: 'Official response recorded and will be visible to the student upon tracking.',
      response: newResponse,
      complaint,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/admin/complaints/:id/notes
 * Adds a private internal administrator note (never exposed to students).
 */
router.post('/:id/notes', validateObjectId('id'), verifyCsrfToken, async (req, res, next) => {
  try {
    const { note } = req.body || {};

    if (!note || typeof note !== 'string' || note.trim().length < 3) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_NOTE',
        message: 'Internal note is required and must be at least 3 characters.',
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        code: 'NOT_FOUND',
        message: 'Complaint record not found.',
      });
    }

    const newNote = {
      note: note.trim(),
      createdBy: {
        name: req.admin.name,
        email: req.admin.email,
        adminId: req.admin._id,
      },
      createdAt: new Date(),
    };

    complaint.internalNotes.push(newNote);
    await complaint.save();

    return res.status(201).json({
      success: true,
      message: 'Internal administrative note saved.',
      internalNote: newNote,
      complaint,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/admin/complaints/:id
 * Deletes complaint and triggers GridFS attachment cleanup.
 */
router.delete('/:id', validateObjectId('id'), verifyCsrfToken, async (req, res, next) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Complaint record not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Complaint record deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/admin/complaints/:id/attachments/:filename (or :fileId)
 * Securely streams the private file attachment to authenticated administrators.
 */
router.get('/:id/attachments/:filename', streamComplaintAttachment);
router.get('/:id/attachments/:fileId', streamComplaintAttachment);
router.get('/:id/attachment', streamComplaintAttachment);

export default router;
