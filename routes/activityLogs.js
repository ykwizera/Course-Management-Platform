const express = require('express');
const activityLogController = require('../controllers/activityLogController');
const { authenticateToken, requireManager, requireFacilitator, requireStaff } = require('../middleware/auth');
const { validationRules, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     ActivityTracker:
 *       type: object
 *       required:
 *         - allocationId
 *         - weekNumber
 *         - weekStartDate
 *         - weekEndDate
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         allocationId:
 *           type: string
 *           format: uuid
 *         facilitatorId:
 *           type: string
 *           format: uuid
 *         weekNumber:
 *           type: integer
 *           minimum: 1
 *           maximum: 52
 *         weekStartDate:
 *           type: string
 *           format: date
 *         weekEndDate:
 *           type: string
 *           format: date
 *         attendance:
 *           type: array
 *           items:
 *             type: boolean
 *         formativeOneGrading:
 *           type: string
 *           enum: [Not Started, Pending, Done]
 *         formativeTwoGrading:
 *           type: string
 *           enum: [Not Started, Pending, Done]
 *         summativeGrading:
 *           type: string
 *           enum: [Not Started, Pending, Done]
 *         courseModeration:
 *           type: string
 *           enum: [Not Started, Pending, Done]
 *         intranetSync:
 *           type: string
 *           enum: [Not Started, Pending, Done]
 *         gradeBookStatus:
 *           type: string
 *           enum: [Not Started, Pending, Done]
 *         submittedAt:
 *           type: string
 *           format: date-time
 *         notes:
 *           type: string
 */

/**
 * @swagger
 * /api/activity-logs:
 *   get:
 *     summary: Get activity logs with filtering
 *     tags: [Activity Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: facilitator
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: course
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: week
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 52
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [complete, incomplete, overdue]
 *     responses:
 *       200:
 *         description: List of activity logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ActivityTracker'
 *                 pagination:
 *                   type: object
 */
router.get('/',
  validationRules.paginationQuery,
  handleValidationErrors,
  activityLogController.getActivityLogs
);

/**
 * @swagger
 * /api/activity-logs/{id}:
 *   get:
 *     summary: Get activity log by ID
 *     tags: [Activity Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Activity log details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityTracker'
 *       404:
 *         description: Activity log not found
 */
router.get('/:id',
  validationRules.uuidParam('id'),
  handleValidationErrors,
  activityLogController.getActivityLogById
);

/**
 * @swagger
 * /api/activity-logs:
 *   post:
 *     summary: Create new activity log (Facilitator only)
 *     tags: [Activity Logs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActivityTracker'
 *     responses:
 *       201:
 *         description: Activity log created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityTracker'
 *       403:
 *         description: Insufficient permissions
 */
router.post('/',
  requireFacilitator,
  validationRules.activityTrackerCreation,
  handleValidationErrors,
  activityLogController.createActivityLog
);

/**
 * @swagger
 * /api/activity-logs/{id}:
 *   put:
 *     summary: Update activity log
 *     tags: [Activity Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActivityTracker'
 *     responses:
 *       200:
 *         description: Activity log updated
 *       404:
 *         description: Activity log not found
 *       403:
 *         description: Insufficient permissions
 */
router.put('/:id',
  validationRules.uuidParam('id'),
  validationRules.activityTrackerUpdate,
  handleValidationErrors,
  activityLogController.updateActivityLog
);

/**
 * @swagger
 * /api/activity-logs/{id}/submit:
 *   post:
 *     summary: Submit activity log for review (Facilitator only)
 *     tags: [Activity Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Activity log submitted
 *       404:
 *         description: Activity log not found
 *       403:
 *         description: Insufficient permissions
 */
router.post('/:id/submit',
  requireFacilitator,
  validationRules.uuidParam('id'),
  handleValidationErrors,
  activityLogController.submitActivityLog
);

module.exports = router;
