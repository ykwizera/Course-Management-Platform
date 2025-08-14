const { Module } = require('../models');
const logger = require('../utils/logger');

// Create a new module
const createModule = async (req, res) => {
  try {
    const { moduleCode, moduleName, description, credits, duration } = req.body;
    const newModule = await Module.create({ moduleCode, moduleName, description, credits, duration });
    res.status(201).json(newModule);
  } catch (error) {
    logger.error('Create module error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Module code must be unique' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all modules
const getModules = async (req, res) => {
  try {
    const modules = await Module.findAll();
    res.json(modules);
  } catch (error) {
    logger.error('Get modules error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get module by ID
const getModuleById = async (req, res) => {
  try {
    const { id } = req.params;
    const module = await Module.findByPk(id);
    if (!module) return res.status(404).json({ error: 'Module not found' });
    res.json(module);
  } catch (error) {
    logger.error('Get module by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a module
const updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { moduleCode, moduleName, description, credits, duration } = req.body;

    const module = await Module.findByPk(id);
    if (!module) return res.status(404).json({ error: 'Module not found' });

    await module.update({ moduleCode, moduleName, description, credits, duration });
    res.json(module);
  } catch (error) {
    logger.error('Update module error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Module code must be unique' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a module
const deleteModule = async (req, res) => {
  try {
    const { id } = req.params;
    const module = await Module.findByPk(id);
    if (!module) return res.status(404).json({ error: 'Module not found' });

    await module.destroy();
    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    logger.error('Delete module error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createModule,
  getModules,
  getModuleById,
  updateModule,
  deleteModule
};
