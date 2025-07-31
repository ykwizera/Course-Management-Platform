const { ActivityTracker, CourseOffering, Facilitator, User, Module, Cohort, Class } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const notificationService = require('../services/notificationService');

const activityLogController = {
  // Get activity logs with filtering
  getActivityLogs: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        facilitator,
        course,
        week,
        status
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Build where clause
      const whereClause = {};

      if (facilitator) {
        whereClause.facilitatorId = facilitator;
      }

      if (course) {
        whereClause.allocationId = course;
      }

      if (week) {
        whereClause.weekNumber = parseInt(week);
      }

      // For facilitators, only show their own logs
      if (req.user.role === 'facilitator') {
        whereClause.facilitatorId = req.user.facilitatorProfile.id;
      }

      let havingClause = null;
      
      // Status filtering requires calculated field
      if (status) {
        switch (status) {
          case 'complete':
            // All fields are 'Done'
            whereClause[Op.and] = [
              { formativeOneGrading: 'Done' },
              { formativeTwoGrading: 'Done' },
              { summativeGrading: 'Done' },
              { courseModeration: 'Done' },
              { intranetSync: 'Done' },
              { gradeBookStatus: 'Done' }
            ];
            break;
          case 'incomplete':
            // At least one field is not 'Done'
            whereClause[Op.or] = [
              { formativeOneGrading: { [Op.ne]: 'Done' } },
              { formativeTwoGrading: { [Op.ne]: 'Done' } },
              { summativeGrading: { [Op.ne]: 'Done' } },
              { courseModeration: { [Op.ne]: 'Done' } },
              { intranetSync: { [Op.ne]: 'Done' } },
              { gradeBookStatus: { [Op.ne]: 'Done' } }
            ];
            break;
          case 'overdue':
            // Submitted late or not submitted within deadline
            whereClause.submittedAt = { [Op.is]: null };
            whereClause.weekEndDate = { [Op.lt]: new Date() };
            break;
        }
      }

      const { count, rows } = await ActivityTracker.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: CourseOffering,
            as: 'courseOffering',
            include: [
              {
                model: Module,
                as: 'module',
                attributes: ['code', 'name']
              },
              {
                model: Cohort,
                as: 'cohort',
                attributes: ['name']
              },
              {
                model: Class,
                as: 'class',
                attributes: ['code', 'name']
              }
            ]
          },
          {
            model: Facilitator,
            as: 'facilitator',
            include: [{
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName', 'email']
            }]
          }
        ],
        limit: parseInt(limit),
        offset,
        order: [['weekNumber', 'DESC'], ['createdAt', 'DESC']]
      });

      const totalPages = Math.ceil(count / parseInt(limit));

      // Add completion percentage to each log
      const logsWithCompletion = rows.map(log => ({
        ...log.toJSON(),
        completionPercentage: log.getCompletionPercentage(),
        isComplete: log.isComplete()
      }));

      res.json({
        data: logsWithCompletion,
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
      logger.error('Get activity logs error:', error);
      res.status(500).json({
        error: {
          message: req.t('errors.internal_server_error')
        }
      });
    }
  },

  // Get activity log by ID
  getActivityLogById: async (req, res) => {
    try {
      const { id } = req.params;

      const whereClause = { id };

      // For facilitators, only allow access to their own logs
      if (req.user.role === 'facilitator') {
        whereClause.facilitatorId = req.user.facilitatorProfile.id;
      }

      const activityLog = await ActivityTracker.findOne({
        where: whereClause,
        include: [
          {
            model: CourseOffering,
            as: 'courseOffering',
            include: [
              { model: Module, as: 'module' },
              { model: Cohort, as: 'cohort' },
              { model: Class, as: 'class' }
            ]
          },
          {
            model: Facilitator,
            as: 'facilitator',
            include: [{
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName', 'email']
            }]
          }
        ]
      });

      if (!activityLog) {
        return res.status(404).json({
          error: {
            message: req.t('activity_logs.not_found')
          }
        });
      }

      res.json({
        ...activityLog.toJSON(),
        completionPercentage: activityLog.getCompletionPercentage(),
        isComplete: activityLog.isComplete()
      });
    } catch (error) {
      logger.error('Get activity log by ID error:', error);
      res.status(500).json({
        error: {
          message: req.t('errors.internal_server_error')
        }
      });
    }
  },

  // Create new activity log (Facilitator only)
  createActivityLog: async (req, res) => {
    try {
      const logData = {
        ...req.body,
        facilitatorId: req.user.facilitatorProfile.id
      };

      // Validate that the week end date is after start date
      if (new Date(logData.weekEndDate) <= new Date(logData.weekStartDate)) {
        return res.status(400).json({
          error: {
            message: req.t('activity_logs.invalid_date_range')
          }
        });
      }

      // Check if facilitator is assigned to this course offering
      const courseOffering = await CourseOffering.findOne({
        where: {
          id: logData.allocationId,
          facilitatorId: req.user.facilitatorProfile.id
        }
      });

      if (!courseOffering) {
        return res.status(403).json({
          error: {
            message: req.t('activity_logs.not_authorized_for_course')
          }
        });
      }

      // Check for duplicate week entry
      const existingLog = await ActivityTracker.findOne({
        where: {
          allocationId: logData.allocationId,
          weekNumber: logData.weekNumber
        }
      });

      if (existingLog) {
        return res.status(409).json({
          error: {
            message: req.t('activity_logs.week_already_exists')
          }
        });
      }

      const activityLog = await ActivityTracker.create(logData);

      // Fetch the created log with associations
      const createdLog = await ActivityTracker.findByPk(activityLog.id, {
        include: [
          {
            model: CourseOffering,
            as: 'courseOffering',
            include: [
              { model: Module, as: 'module' },
              { model: Cohort, as: 'cohort' },
              { model: Class, as: 'class' }
            ]
          }
        ]
      });

      logger.info(`Activity log created: ${activityLog.id} by ${req.user.email}`);

      res.status(201).json({
        ...createdLog.toJSON(),
        completionPercentage: createdLog.getCompletionPercentage(),
        isComplete: createdLog.isComplete()
      });
    } catch (error) {
      logger.error('Create activity log error:', error);
      
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
          error: {
            message: req.t('activity_logs.invalid_reference')
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

  // Update activity log
  updateActivityLog: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const whereClause = { id };

      // For facilitators, only allow updating their own logs
      if (req.user.role === 'facilitator') {
        whereClause.facilitatorId = req.user.facilitatorProfile.id;
      }

      const activityLog = await ActivityTracker.findOne({
        where: whereClause
      });

      if (!activityLog) {
        return res.status(404).json({
          error: {
            message: req.t('activity_logs.not_found')
          }
        });
      }

      // Validate date range if dates are being updated
      if (updateData.weekStartDate || updateData.weekEndDate) {
        const startDate = updateData.weekStartDate || activityLog.weekStartDate;
        const endDate = updateData.weekEndDate || activityLog.weekEndDate;
        
        if (new Date(endDate) <= new Date(startDate)) {
          return res.status(400).json({
            error: {
              message: req.t('activity_logs.invalid_date_range')
            }
          });
        }
      }

      await activityLog.update(updateData);

      // Fetch updated log with associations
      const updatedLog = await ActivityTracker.findByPk(id, {
        include: [
          {
            model: CourseOffering,
            as: 'courseOffering',
            include: [
              { model: Module, as: 'module' },
              { model: Cohort, as: 'cohort' },
              { model: Class, as: 'class' }
            ]
          }
        ]
      });

      logger.info(`Activity log updated: ${id} by ${req.user.email}`);

      res.json({
        ...updatedLog.toJSON(),
        completionPercentage: updatedLog.getCompletionPercentage(),
        isComplete: updatedLog.isComplete()
      });
    } catch (error) {
      logger.error('Update activity log error:', error);
      res.status(500).json({
        error: {
          message: req.t('errors.internal_server_error')
        }
      });
    }
  },

  // Submit activity log for review (Facilitator only)
  submitActivityLog: async (req, res) => {
    try {
      const { id } = req.params;

      const activityLog = await ActivityTracker.findOne({
        where: {
          id,
          facilitatorId: req.user.facilitatorProfile.id
        },
        include: [
          {
            model: CourseOffering,
            as: 'courseOffering',
            include: [
              { model: Module, as: 'module' },
              { model: Cohort, as: 'cohort' }
            ]
          }
        ]
      });

      if (!activityLog) {
        return res.status(404).json({
          error: {
            message: req.t('activity_logs.not_found')
          }
        });
      }

      // Check if already submitted
      if (activityLog.submittedAt) {
        return res.status(400).json({
          error: {
            message: req.t('activity_logs.already_submitted')
          }
        });
      }

      // Update submission timestamp
      await activityLog.update({
        submittedAt: new Date()
      });

      // Send notification to managers
      await notificationService.notifyActivityLogSubmission(activityLog, req.user);

      logger.info(`Activity log submitted: ${id} by ${req.user.email}`);

      res.json({
        message: req.t('activity_logs.submitted_successfully'),
        submittedAt: activityLog.submittedAt
      });
    } catch (error) {
      logger.error('Submit activity log error:', error);
      res.status(500).json({
        error: {
          message: req.t('errors.internal_server_error')
        }
      });
    }
  }
};

module.exports = activityLogController;
