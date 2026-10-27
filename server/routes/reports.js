import express from 'express';
import { Complaint, ALLOWED_CATEGORIES, ALLOWED_STATUSES } from '../models/Complaint.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAdminAuth);

/**
 * GET /api/v1/admin/reports/summary
 * Returns database-backed operational statistics across all complaints.
 */
router.get('/summary', async (req, res, next) => {
  try {
    const [total, statusAgg, categoryAgg, priorityAgg] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Complaint.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      Complaint.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
    ]);

    // Map status breakdown ensuring all allowed statuses exist in result
    const statusMap = {};
    ALLOWED_STATUSES.forEach((s) => (statusMap[s] = 0));
    statusAgg.forEach((item) => {
      if (item._id) statusMap[item._id] = item.count;
    });

    // Map category breakdown
    const categoryMap = {};
    ALLOWED_CATEGORIES.forEach((c) => (categoryMap[c] = 0));
    categoryAgg.forEach((item) => {
      if (item._id) categoryMap[item._id] = item.count;
    });

    // Map priority breakdown
    const priorityMap = { Low: 0, Medium: 0, High: 0, Urgent: 0 };
    priorityAgg.forEach((item) => {
      if (item._id && priorityMap[item._id] !== undefined) priorityMap[item._id] = item.count;
    });

    const pendingReview = (statusMap['Submitted'] || 0) + (statusMap['Under Review'] || 0);

    return res.status(200).json({
      success: true,
      summary: {
        total,
        pendingReview,
        inProgress: statusMap['In Progress'] || 0,
        resolved: statusMap['Resolved'] || 0,
        byStatus: statusMap,
        byCategory: categoryMap,
        byPriority: priorityMap,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
