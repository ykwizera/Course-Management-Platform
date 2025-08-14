const express = require('express');
const router = express.Router();
const {
  createCourseOffering,
  getCourseOfferings,
  getCourseOfferingById,
  updateCourseOffering,
  deleteCourseOffering
} = require('../controllers/courseOfferingController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');

/**
 * @swagger
 * tags:
 *   name: Course Offerings
 *   description: Manage course offerings
 */

//authentication
router.use(authenticateToken);

/**
 * @swagger
 * /course-offerings:
 *   get:
 *     summary: Get all course offerings
 *     tags: [Course Offerings]
 *     responses:
 *       200:
 *         description: List of course offerings
 */
router.get('/', getCourseOfferings);

/**
 * @swagger
 * /course-offerings/{id}:
 *   get:
 *     summary: Get a specific course offering by ID
 *     tags: [Course Offerings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The course offering ID
 *     responses:
 *       200:
 *         description: Course offering data
 *       404:
 *         description: Not found
 */
router.get('/:id', getCourseOfferingById);

/**
 * @swagger
 * /course-offerings:
 *   post:
 *     summary: Create a new course offering
 *     tags: [Course Offerings]
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
 *         description: Course offering created
 */
router.post('/', requireRole(['manager']), validateRequest(schemas.courseOffering), createCourseOffering);

/**
 * @swagger
 * /course-offerings/{id}:
 *   put:
 *     summary: Update an existing course offering
 *     tags: [Course Offerings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The course offering ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseOffering'
 *     responses:
 *       200:
 *         description: Course offering updated
 *       404:
 *         description: Not found
 */
router.put('/:id', requireRole(['manager']), validateRequest(schemas.courseOffering), updateCourseOffering);

/**
 * @swagger
 * /course-offerings/{id}:
 *   delete:
 *     summary: Delete a course offering
 *     tags: [Course Offerings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The course offering ID
 *     responses:
 *       204:
 *         description: Course offering deleted
 */
router.delete('/:id', requireRole(['manager']), deleteCourseOffering);

module.exports = router;
