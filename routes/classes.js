const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { authenticateToken } = require('../middleware/auth');
const Joi = require('joi');
const { validateRequest } = require('../middleware/validation');

// Validation schema
const classSchema = Joi.object({
  className: Joi.string().required(),
  year: Joi.number().integer().required(),
  semester: Joi.string().required(),
  isActive: Joi.boolean().optional()
});

// authentication
router.use(authenticateToken);

// CRUD routes
router.post('/', validateRequest(classSchema), classController.createClass);
router.get('/', classController.getClasses);
router.get('/:id', classController.getClassById);
router.put('/:id', validateRequest(classSchema), classController.updateClass);
router.delete('/:id', classController.deleteClass);

module.exports = router;
