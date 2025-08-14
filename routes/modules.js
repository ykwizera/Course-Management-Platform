const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');
const { authenticateToken } = require('../middleware/auth');
const Joi = require('joi');
const { validateRequest } = require('../middleware/validation');

// Validation schema
const moduleSchema = Joi.object({
  moduleCode: Joi.string().required(),
  moduleName: Joi.string().required(),
  description: Joi.string().optional(),
  credits: Joi.number().integer().positive().optional(),
  duration: Joi.number().integer().positive().optional()
});

//authentication
router.use(authenticateToken);

// CRUD routes
router.post('/', validateRequest(moduleSchema), moduleController.createModule);
router.get('/', moduleController.getModules);
router.get('/:id', moduleController.getModuleById);
router.put('/:id', validateRequest(moduleSchema), moduleController.updateModule);
router.delete('/:id', moduleController.deleteModule);

module.exports = router;
