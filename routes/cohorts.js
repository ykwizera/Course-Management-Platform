const express = require('express');
const router = express.Router();
const cohortController = require('../controllers/cohortController');
const { authenticateToken } = require('../middleware/auth');
const Joi = require('joi');
const { validateRequest } = require('../middleware/validation');

// Validation schema
const cohortSchema = Joi.object({
  cohortName: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  program: Joi.string().required(),
  isActive: Joi.boolean().optional()
});

// authentication
router.use(authenticateToken);

// CRUD routes
router.post('/', validateRequest(cohortSchema), cohortController.createCohort);
router.get('/', cohortController.getCohorts);
router.get('/:id', cohortController.getCohortById);
router.put('/:id', validateRequest(cohortSchema), cohortController.updateCohort);
router.delete('/:id', cohortController.deleteCohort);

module.exports = router;
