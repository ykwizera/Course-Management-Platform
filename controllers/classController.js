const { Class } = require('../models');
const logger = require('../utils/logger');

// Create a new class
const createClass = async (req, res) => {
  try {
    const { className, year, semester } = req.body;
    const newClass = await Class.create({ className, year, semester });
    res.status(201).json(newClass);
  } catch (error) {
    logger.error('Create class error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Class name must be unique' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all classes
const getClasses = async (req, res) => {
  try {
    const classes = await Class.findAll();
    res.json(classes);
  } catch (error) {
    logger.error('Get classes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a class by ID
const getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const foundClass = await Class.findByPk(id);
    if (!foundClass) return res.status(404).json({ error: 'Class not found' });
    res.json(foundClass);
  } catch (error) {
    logger.error('Get class by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a class
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { className, year, semester, isActive } = req.body;

    const foundClass = await Class.findByPk(id);
    if (!foundClass) return res.status(404).json({ error: 'Class not found' });

    await foundClass.update({ className, year, semester, isActive });
    res.json(foundClass);
  } catch (error) {
    logger.error('Update class error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Class name must be unique' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a class
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const foundClass = await Class.findByPk(id);
    if (!foundClass) return res.status(404).json({ error: 'Class not found' });

    await foundClass.destroy();
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    logger.error('Delete class error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass
};
