const express = require('express');
const courseAllocationController = require('../controllers/courseAllocationController');
const { authenticateToken, requireManager, requireStaff } = require('../middleware/auth');
const { validationRules, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     CourseOffering:
 *       type: object
 *       required:
 *         - moduleId
 *         - facilitatorId
 *         - cohortId
 *         - classId
 *         - modeId
 *         - intakePeriod
 *         - startDate
 *         - endDate
 *         - maxStudents
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         moduleId:
 *           type: string
 *           format: uuid
 *         facilitatorId:
 *           type: string
 *           format: uuid
 *         cohortId:
 *           type: string
 *           format: uuid
 *         classId:
 *           type: string
 *           format: uuid
 *         modeId:
 *           type: string
 *           format: uuid
 *         intakePeriod:
 *           type: string
 *           enum: [HT1, HT2, FT]
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         maxStudents:
 *           type: integer
 *           minimum: 1
 *         status:
 *           type: string
 *           enum: [planned, active, completed, cancelled]
 *         notes:
 *           type: string
 */

/**
 * @swagger
 * /api/course-allocations:
 *   get:
 *     summary: Get course allocations with filtering
 *     tags: [Course Allocations]
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
 *         name: trimester
 *         schema:
 *           type: string
 *       - in: query
 *         name: cohort
 *         schema:
 *           type: string
 *       - in: query
 *         name: intake
 *         schema:
 *           type: string
 *           enum: [HT1, HT2, FT]
 *       - in: query
 *         name: facilitator
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: mode
 *         schema:
 *           type: string
 *           enum: [online, in-person, hybrid]
 *     responses:
 *       200:
 *         description: List of course allocations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CourseOffering'
 *                 pagination:
 *                   type: object
 */
router.get('/',
  validationRules.paginationQuery,
  handleValidationErrors,
  courseAllocationController.getAllocations
);

/**
 * @swagger
 * /api/course-allocations/{id}:
 *   get:
 *     summary: Get course allocation by ID
 *     tags: [Course Allocations]
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
 *         description: Course allocation details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseOffering'
 *       404:
 *         description: Course allocation not found
 */
router.get('/:id',
  validationRules.uuidParam('id'),
  handleValidationErrors,
  courseAllocationController.getAllocationById
);

/**
 * @swagger
 * /api/course-allocations:
 *   post:
 *     summary: Create new course allocation (Manager only)
 *     tags: [Course Allocations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseOffering'
 *     responses:
 *       201:
 *         description: Course allocation created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseOffering'
 *       403:
 *         description: Insufficient permissions
 */
router.post('/',
  requireManager,
  validationRules.courseOfferingCreation,
  handleValidationErrors,
  courseAllocationController.createAllocation
);

/**
 * @swagger
 * /api/course-allocations/{id}:
 *   put:
 *     summary: Update course allocation (Manager only)
 *     tags: [Course Allocations]
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
 *             $ref: '#/components/schemas/CourseOffering'
 *     responses:
 *       200:
 *         description: Course allocation updated
 *       404:
 *         description: Course allocation not found
 *       403:
 *         description: Insufficient permissions
 */
router.put('/:id',
  requireManager,
  validationRules.uuidParam('id'),
  validationRules.courseOfferingCreation,
  handleValidationErrors,
  courseAllocationController.updateAllocation
);

/**
 * @swagger
 * /api/course-allocations/{id}:
 *   delete:
 *     summary: Delete course allocation (Manager only)
 *     tags: [Course Allocations]
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
 *       204:
 *         description: Course allocation deleted
 *       404:
 *         description: Course allocation not found
 *       403:
 *         description: Insufficient permissions
 */
router.delete('/:id',
  requireManager,
  validationRules.uuidParam('id'),
  handleValidationErrors,
  courseAllocationController.deleteAllocation
);

module.exports = router;
