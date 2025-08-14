const express = require('express');
const router = express.Router();
const modeController = require('../controllers/modeController');
const { authenticateToken } = require('../middleware/auth');
const Joi = require('joi');
const { validateRequest } = require('../middleware/validation');

// Validation schema
const modeSchema = Joi.object({
  modeName: Joi.string().valid('Online', 'In-person', 'Hybrid').required(),
  description: Joi.string().optional()
});

// authentication
router.use(authenticateToken);

// CRUD routes
router.post('/', validateRequest(modeSchema), modeController.createMode);
router.get('/', modeController.getModes);
router.get('/:id', modeController.getModeById);
router.put('/:id', validateRequest(modeSchema), modeController.updateMode);
router.delete('/:id', modeController.deleteMode);

module.exports = router;
