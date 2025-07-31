const { CourseOffering, Module, Facilitator, Cohort, Class, Mode, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const courseAllocationController = {
  // Get all course allocations with filtering
  getAllocations: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        trimester,
        cohort,
        intake,
        facilitator,
        mode
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Build where clause for filtering
      const whereClause = {};
      
      if (intake) {
        whereClause.intakePeriod = intake;
      }

      // Build include array for associations
      const includeArray = [
        {
          model: Module,
          as: 'module',
          attributes: ['id', 'code', 'name', 'credits']
        },
        {
          model: Facilitator,
          as: 'facilitator',
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'email']
          }]
        },
        {
          model: Cohort,
          as: 'cohort',
          attributes: ['id', 'name', 'startDate', 'endDate']
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'code', 'name', 'year', 'trimester']
        },
        {
          model: Mode,
          as: 'mode',
          attributes: ['id', 'name']
        }
      ];

      // Add filtering conditions to includes
      if (trimester) {
        includeArray.find(inc => inc.as === 'class').where = {
          trimester
        };
      }

      if (cohort) {
        includeArray.find(inc => inc.as === 'cohort').where = {
          name: { [Op.like]: `%${cohort}%` }
        };
      }

      if (facilitator) {
        whereClause.facilitatorId = facilitator;
      }

      if (mode) {
        includeArray.find(inc => inc.as === 'mode').where = {
          name: mode
        };
      }

      // For facilitators, only show their own assignments
      if (req.user.role === 'facilitator') {
        whereClause.facilitatorId = req.user.facilitatorProfile.id;
      }

      const { count, rows } = await CourseOffering.findAndCountAll({
        where: whereClause,
        include: includeArray,
        limit: parseInt(limit),
        offset,
        order: [['createdAt', 'DESC']]
      });

      const totalPages = Math.ceil(count / parseInt(limit));

      res.json({
        data: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      });
    } catch (error) {
      logger.error('Get allocations error:', error);
      res.status(500).json({
        error: {
          message: req.t('errors.internal_server_error')
        }
      });
    }
  },

  // Get course allocation by ID
  getAllocationById: async (req, res) => {
    try {
      const { id } = req.params;

      const whereClause = { id };

      // For facilitators, only allow access to their own assignments
      if (req.user.role === 'facilitator') {
        whereClause.facilitatorId = req.user.facilitatorProfile.id;
      }

      const allocation = await CourseOffering.findOne({
        where: whereClause,
        include: [
          {
            model: Module,
            as: 'module'
          },
          {
            model: Facilitator,
            as: 'facilitator',
            include: [{
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName', 'email']
            }]
          },
          {
            model: Cohort,
            as: 'cohort'
          },
          {
            model: Class,
            as: 'class'
          },
          {
            model: Mode,
            as: 'mode'
          }
        ]
      });

      if (!allocation) {
        return res.status(404).json({
          error: {
            message: req.t('course_allocations.not_found')
          }
        });
      }

      res.json(allocation);
    } catch (error) {
      logger.error('Get allocation by ID error:', error);
      res.status(500).json({
        error: {
          message: req.t('errors.internal_server_error')
        }
      });
    }
  },

  // Create new course allocation (Manager only)
  createAllocation: async (req, res) => {
    try {
      const allocationData = req.body;

      // Validate that the end date is after start date
      if (new Date(allocationData.endDate) <= new Date(allocationData.startDate)) {
        return res.status(400).json({
          error: {
            message: req.t('course_allocations.invalid_date_range')
          }
        });
      }

      // Check for conflicts (same facilitator, overlapping dates)
      const existingAllocation = await CourseOffering.findOne({
        where: {
          facilitatorId: allocationData.facilitatorId,
          [Op.or]: [
            {
              startDate: {
                [Op.between]: [allocationData.startDate, allocationData.endDate]
              }
            },
            {
              endDate: {
                [Op.between]: [allocationData.startDate, allocationData.endDate]
              }
            },
            {
              [Op.and]: [
                { startDate: { [Op.lte]: allocationData.startDate } },
                { endDate: { [Op.gte]: allocationData.endDate } }
              ]
            }
          ]
        }
      });

      if (existingAllocation) {
        return res.status(409).json({
          error: {
            message: req.t('course_allocations.facilitator_conflict')
          }
        });
      }

      const allocation = await CourseOffering.create(allocationData);

      // Fetch the created allocation with all associations
      const createdAllocation = await CourseOffering.findByPk(allocation.id, {
        include: [
          { model: Module, as: 'module' },
          { 
            model: Facilitator, 
            as: 'facilitator',
            include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] }]
          },
          { model: Cohort, as: 'cohort' },
          { model: Class, as: 'class' },
          { model: Mode, as: 'mode' }
        ]
      });

      logger.info(`Course allocation created: ${allocation.id} by ${req.user.email}`);

      res.status(201).json(createdAllocation);
    } catch (error) {
      logger.error('Create allocation error:', error);
      
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
          error: {
            message: req.t('course_allocations.invalid_reference')
          }
        });
      }

      res.status(500).json({
        error: {
          message: req.t('errors.internal_server_error')
        }
      });
    }
  },

  // Update course allocation (Manager only)
  updateAllocation: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const allocation = await CourseOffering.findByPk(id);
      if (!allocation) {
        return res.status(404).json({
          error: {
            message: req.t('course_allocations.not_found')
          }
        });
      }

      // Validate date range if dates are being updated
      if (updateData.startDate || updateData.endDate) {
        const startDate = updateData.startDate || allocation.startDate;
        const endDate = updateData.endDate || allocation.endDate;
        
        if (new Date(endDate) <= new Date(startDate)) {
          return res.status(400).json({
            error: {
              message: req.t('course_allocations.invalid_date_range')
            }
          });
        }
      }

      await allocation.update(updateData);

      // Fetch updated allocation with associations
      const updatedAllocation = await CourseOffering.findByPk(id, {
        include: [
          { model: Module, as: 'module' },
          { 
            model: Facilitator, 
            as: 'facilitator',
            include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] }]
          },
          { model: Cohort, as: 'cohort' },
          { model: Class, as: 'class' },
          { model: Mode, as: 'mode' }
        ]
      });

      logger.info(`Course allocation updated: ${id} by ${req.user.email}`);

      res.json(updatedAllocation);
    } catch (error) {
      logger.error('Update allocation error:', error);
      
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
          error: {
            message: req.t('course_allocations.invalid_reference')
          }
        });
      }

      res.status(500).json({
        error: {
          message: req.t('errors.internal_server_error')
        }
      });
    }
  },

  // Delete course allocation (Manager only)
  deleteAllocation: async (req, res) => {
    try {
      const { id } = req.params;

      const allocation = await CourseOffering.findByPk(id);
      if (!allocation) {
        return res.status(404).json({
          error: {
            message: req.t('course_allocations.not_found')
          }
        });
      }

      await allocation.destroy();

      logger.info(`Course allocation deleted: ${id} by ${req.user.email}`);

      res.status(204).send();
    } catch (error) {
      logger.error('Delete allocation error:', error);
      res.status(500).json({
        error: {
          message: req.t('errors.internal_server_error')
        }
      });
    }
  }
};

module.exports = courseAllocationController;
