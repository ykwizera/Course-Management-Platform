const { Cohort } = require('../models');
const logger = require('../utils/logger');

// Create a new cohort
const createCohort = async (req, res) => {
  try {
    const { cohortName, startDate, endDate, program } = req.body;
    const newCohort = await Cohort.create({ cohortName, startDate, endDate, program });
    res.status(201).json(newCohort);
  } catch (error) {
    logger.error('Create cohort error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Cohort name must be unique' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all cohorts
const getCohorts = async (req, res) => {
  try {
    const cohorts = await Cohort.findAll();
    res.json(cohorts);
  } catch (error) {
    logger.error('Get cohorts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a cohort by ID
const getCohortById = async (req, res) => {
  try {
    const { id } = req.params;
    const foundCohort = await Cohort.findByPk(id);
    if (!foundCohort) return res.status(404).json({ error: 'Cohort not found' });
    res.json(foundCohort);
  } catch (error) {
    logger.error('Get cohort by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a cohort
const updateCohort = async (req, res) => {
  try {
    const { id } = req.params;
    const { cohortName, startDate, endDate, program, isActive } = req.body;

    const foundCohort = await Cohort.findByPk(id);
    if (!foundCohort) return res.status(404).json({ error: 'Cohort not found' });

    await foundCohort.update({ cohortName, startDate, endDate, program, isActive });
    res.json(foundCohort);
  } catch (error) {
    logger.error('Update cohort error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Cohort name must be unique' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a cohort
const deleteCohort = async (req, res) => {
  try {
    const { id } = req.params;
    const foundCohort = await Cohort.findByPk(id);
    if (!foundCohort) return res.status(404).json({ error: 'Cohort not found' });

    await foundCohort.destroy();
    res.json({ message: 'Cohort deleted successfully' });
  } catch (error) {
    logger.error('Delete cohort error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createCohort,
  getCohorts,
  getCohortById,
  updateCohort,
  deleteCohort
};
