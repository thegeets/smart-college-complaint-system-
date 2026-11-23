import express from 'express';
import { Complaint, ALLOWED_STATUSES, VALID_STATUS_TRANSITIONS } from '../models/Complaint.js';
import { requireAdminAuth } from '../middleware/auth.js';
import { verifyCsrfToken } from '../middleware/csrf.js';
import { validateObjectId } from '../middleware/validate.js';
import { streamComplaintAttachment } from '../controllers/attachmentController.js';

const router = express.Router();

// Enforce admin session authentication across all routes in this file
router.use(requireAdminAuth);

/**
 * GET /api/v1/admin/complaints
 * Returns paginated, searchable, and filterable complaint records.
 */
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '15', 10)));
    const skip = (page - 1) * limit;

    const filter = {};

    // Filter by status
    if (req.query.status && ALLOWED_STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    // Filter by category
    if (req.query.category && typeof req.query.category === 'string') {
      filter.category = req.query.category.trim();
    }

    // Filter by priority
    if (req.query.priority && typeof req.query.priority === 'string') {
      filter.priority = req.query.priority.trim();
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        const start = new Date(req.query.startDate);
        if (!isNaN(start.getTime())) filter.createdAt.$gte = start;
      }
      if (req.query.endDate) {
        const end = new Date(req.query.endDate);
        if (!isNaN(end.getTime())) {
          end.setHours(23, 59, 59, 999);
          filter.createdAt.$lte = end;
        }
      }
    }

    // Keyword search in reference, title, or student name
    if (req.query.search && typeof req.query.search === 'string') {
      const searchStr = req.query.search.trim();
      filter.$or = [
        { reference: { $regex: searchStr, $options: 'i' } },
        { title: { $regex: searchStr, $options: 'i' } },
        { 'student.name': { $regex: searchStr, $options: 'i' } },
        { 'student.studentId': { $regex: searchStr, $options: 'i' } },
      ];
    }

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .sort({ createdAt: -1 })
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

    // Append audit timeline entry
    const timestamp = new Date();
    complaint.timeline.push({
      action: `Status Changed to ${status}`,
      fromStatus: currentStatus,
      toStatus: status,
      note: note && typeof note === 'string' ? note.trim() : `Status transitioned from ${currentStatus} to ${status}`,
      performedBy: `${req.admin.name} (Admin)`,
      timestamp,
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
 * GET /api/v1/admin/complaints/:id/attachments/:filename
 * Securely streams the private file attachment to authenticated administrators.
 */
router.get('/:id/attachments/:filename', streamComplaintAttachment);
router.get('/:id/attachment', streamComplaintAttachment);

export default router;
