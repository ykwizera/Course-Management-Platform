const { Mode } = require('../models');
const logger = require('../utils/logger');

// Create a new mode
const createMode = async (req, res) => {
  try {
    const { modeName, description } = req.body;
    const newMode = await Mode.create({ modeName, description });
    res.status(201).json(newMode);
  } catch (error) {
    logger.error('Create mode error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Mode name must be unique' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all modes
const getModes = async (req, res) => {
  try {
    const modes = await Mode.findAll();
    res.json(modes);
  } catch (error) {
    logger.error('Get modes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get mode by ID
const getModeById = async (req, res) => {
  try {
    const { id } = req.params;
    const foundMode = await Mode.findByPk(id);
    if (!foundMode) return res.status(404).json({ error: 'Mode not found' });
    res.json(foundMode);
  } catch (error) {
    logger.error('Get mode by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a mode
const updateMode = async (req, res) => {
  try {
    const { id } = req.params;
    const { modeName, description } = req.body;

    const foundMode = await Mode.findByPk(id);
    if (!foundMode) return res.status(404).json({ error: 'Mode not found' });

    await foundMode.update({ modeName, description });
    res.json(foundMode);
  } catch (error) {
    logger.error('Update mode error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Mode name must be unique' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a mode
const deleteMode = async (req, res) => {
  try {
    const { id } = req.params;
    const foundMode = await Mode.findByPk(id);
    if (!foundMode) return res.status(404).json({ error: 'Mode not found' });

    await foundMode.destroy();
    res.json({ message: 'Mode deleted successfully' });
  } catch (error) {
    logger.error('Delete mode error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createMode,
  getModes,
  getModeById,
  updateMode,
  deleteMode
};
