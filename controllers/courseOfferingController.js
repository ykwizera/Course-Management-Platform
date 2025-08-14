const { CourseOffering, Module, Facilitator, Cohort, Class, Mode, Manager } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const createCourseOffering = async (req, res) => {
  try {
    const courseOfferingData = {
      ...req.body,
      createdBy: req.user.id
    };

    const courseOffering = await CourseOffering.create(courseOfferingData);
    
    const fullCourseOffering = await CourseOffering.findByPk(courseOffering.id, {
      include: [
        { model: Module, as: 'module' },
        { model: Facilitator, as: 'facilitator' },
        { model: Cohort, as: 'cohort' },
        { model: Class, as: 'class' },
        { model: Mode, as: 'mode' },
        { model: Manager, as: 'creator' }
      ]
    });

    logger.info(`Course offering created by manager ${req.user.id}`, { courseOfferingId: courseOffering.id });

    res.status(201).json(fullCourseOffering);
  } catch (error) {
    logger.error('Create course offering error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Course offering with these parameters already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCourseOfferings = async (req, res) => {
  try {
    const {
      trimester,
      cohortId,
      facilitatorId,
      modeId,
      intakePeriod,
      page = 1,
      limit = 10
    } = req.query;

    const where = { isActive: true };
    
    // Apply filters
    if (trimester) where.trimester = trimester;
    if (cohortId) where.cohortId = cohortId;
    if (facilitatorId) where.facilitatorId = facilitatorId;
    if (modeId) where.modeId = modeId;
    if (intakePeriod) where.intakePeriod = intakePeriod;

    // If user is a facilitator, only show their assigned courses
    if (req.user.role === 'facilitator') {
      where.facilitatorId = req.user.id;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await CourseOffering.findAndCountAll({
      where,
      include: [
        { model: Module, as: 'module' },
        { model: Facilitator, as: 'facilitator' },
        { model: Cohort, as: 'cohort' },
        { model: Class, as: 'class' },
        { model: Mode, as: 'mode' },
        { model: Manager, as: 'creator' }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      courseOfferings: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Get course offerings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCourseOfferingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const where = { id, isActive: true };
    
    // If user is a facilitator, only allow access to their assigned courses
    if (req.user.role === 'facilitator') {
      where.facilitatorId = req.user.id;
    }

    const courseOffering = await CourseOffering.findOne({
      where,
      include: [
        { model: Module, as: 'module' },
        { model: Facilitator, as: 'facilitator' },
        { model: Cohort, as: 'cohort' },
        { model: Class, as: 'class' },
        { model: Mode, as: 'mode' },
        { model: Manager, as: 'creator' }
      ]
    });

    if (!courseOffering) {
      return res.status(404).json({ error: 'Course offering not found' });
    }

    res.json(courseOffering);
  } catch (error) {
    logger.error('Get course offering by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateCourseOffering = async (req, res) => {
  try {
    const { id } = req.params;
    
    const courseOffering = await CourseOffering.findOne({
      where: { id, isActive: true }
    });

    if (!courseOffering) {
      return res.status(404).json({ error: 'Course offering not found' });
    }

    await courseOffering.update(req.body);
    
    const updatedCourseOffering = await CourseOffering.findByPk(id, {
      include: [
        { model: Module, as: 'module' },
        { model: Facilitator, as: 'facilitator' },
        { model: Cohort, as: 'cohort' },
        { model: Class, as: 'class' },
        { model: Mode, as: 'mode' },
        { model: Manager, as: 'creator' }
      ]
    });

    logger.info(`Course offering ${id} updated by manager ${req.user.id}`);

    res.json(updatedCourseOffering);
  } catch (error) {
    logger.error('Update course offering error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteCourseOffering = async (req, res) => {
  try {
    const { id } = req.params;
    
    const courseOffering = await CourseOffering.findOne({
      where: { id, isActive: true }
    });

    if (!courseOffering) {
      return res.status(404).json({ error: 'Course offering not found' });
    }

    // Soft delete by setting isActive to false
    await courseOffering.update({ isActive: false });

    logger.info(`Course offering ${id} deleted by manager ${req.user.id}`);

    res.json({ message: 'Course offering deleted successfully' });
  } catch (error) {
    logger.error('Delete course offering error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createCourseOffering,
  getCourseOfferings,
  getCourseOfferingById,
  updateCourseOffering,
  deleteCourseOffering
};