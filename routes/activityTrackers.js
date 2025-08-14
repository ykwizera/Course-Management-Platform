const express = require('express');
const router = express.Router();
const {
  createActivityTracker,
  getActivityTrackers,
  getActivityTrackerById,
  updateActivityTracker,
  deleteActivityTracker,
  getActivitySummary
} = require('../controllers/activityTrackerController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');

// authentication
router.use(authenticateToken);

// Get activity summary (dashboard data)
router.get('/summary', getActivitySummary);

// Get all activity trackers
router.get('/', getActivityTrackers);

// Get specific activity tracker
router.get('/:id', getActivityTrackerById);

// Create activity tracker (facilitators for their courses, managers for any)
router.post('/', validateRequest(schemas.activityTracker), createActivityTracker);

// Update activity tracker (facilitators for their courses, managers for any)
router.put('/:id', validateRequest(schemas.activityTracker), updateActivityTracker);

// Delete activity tracker (managers only)
router.delete('/:id', requireRole(['manager']), deleteActivityTracker);

module.exports = router;
/**
 * @swagger
 * tags:
 *   name: Activity Trackers
 *   description: Manage activity trackers
 */