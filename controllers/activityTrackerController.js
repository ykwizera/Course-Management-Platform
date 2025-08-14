const { ActivityTracker, CourseOffering, Module, Facilitator, Cohort } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { emailQueue } = require('../services/notificationService');

const createActivityTracker = async (req, res) => {
  try {
    const { allocationId } = req.body;

    // Verify course offering exists and user has access
    const where = { id: allocationId, isActive: true };
    if (req.user.role === 'facilitator') {
      where.facilitatorId = req.user.id;
    }

    const courseOffering = await CourseOffering.findOne({ where });
    if (!courseOffering) {
      return res.status(404).json({ error: 'Course offering not found or access denied' });
    }

    const activityTracker = await ActivityTracker.create({
      ...req.body,
      submittedAt: new Date()
    });

    const fullActivityTracker = await ActivityTracker.findByPk(activityTracker.id, {
      include: [{
        model: CourseOffering,
        as: 'courseOffering',
        include: [
          { model: Module, as: 'module' },
          { model: Facilitator, as: 'facilitator' },
          { model: Cohort, as: 'cohort' }
        ]
      }]
    });

    // Send notification to manager about submission
    if (req.user.role === 'facilitator') {
      await emailQueue.add('activity_submitted', {
        courseOfferingId: allocationId,
        facilitatorId: req.user.id,
        weekNumber: req.body.weekNumber
      });
    }

    logger.info(`Activity tracker created for allocation ${allocationId} by user ${req.user.id}`);

    res.status(201).json(fullActivityTracker);
  } catch (error) {
    logger.error('Create activity tracker error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Activity tracker for this week already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getActivityTrackers = async (req, res) => {
  try {
    const {
      allocationId,
      weekNumber,
      facilitatorId,
      status,
      page = 1,
      limit = 10
    } = req.query;

    let include = [{
      model: CourseOffering,
      as: 'courseOffering',
      where: { isActive: true },
      include: [
        { model: Module, as: 'module' },
        { model: Facilitator, as: 'facilitator' },
        { model: Cohort, as: 'cohort' }
      ]
    }];

    // Apply access control for facilitators
    if (req.user.role === 'facilitator') {
      include[0].where.facilitatorId = req.user.id;
    }

    const where = {};
    
    // Apply filters
    if (allocationId) where.allocationId = allocationId;
    if (weekNumber) where.weekNumber = weekNumber;
    if (facilitatorId && req.user.role === 'manager') {
      include[0].where.facilitatorId = facilitatorId;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await ActivityTracker.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset,
      order: [['weekNumber', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      activityTrackers: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Get activity trackers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getActivityTrackerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    let include = [{
      model: CourseOffering,
      as: 'courseOffering',
      where: { isActive: true },
      include: [
        { model: Module, as: 'module' },
        { model: Facilitator, as: 'facilitator' },
        { model: Cohort, as: 'cohort' }
      ]
    }];

    // Apply access control for facilitators
    if (req.user.role === 'facilitator') {
      include[0].where.facilitatorId = req.user.id;
    }

    const activityTracker = await ActivityTracker.findOne({
      where: { id },
      include
    });

    if (!activityTracker) {
      return res.status(404).json({ error: 'Activity tracker not found or access denied' });
    }

    res.json(activityTracker);
  } catch (error) {
    logger.error('Get activity tracker by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateActivityTracker = async (req, res) => {
  try {
    const { id } = req.params;
    
    let include = [{
      model: CourseOffering,
      as: 'courseOffering',
      where: { isActive: true }
    }];

    // Apply access control for facilitators
    if (req.user.role === 'facilitator') {
      include[0].where.facilitatorId = req.user.id;
    }

    const activityTracker = await ActivityTracker.findOne({
      where: { id },
      include
    });

    if (!activityTracker) {
      return res.status(404).json({ error: 'Activity tracker not found or access denied' });
    }

    await activityTracker.update({
      ...req.body,
      submittedAt: new Date()
    });

    const updatedActivityTracker = await ActivityTracker.findByPk(id, {
      include: [{
        model: CourseOffering,
        as: 'courseOffering',
        include: [
          { model: Module, as: 'module' },
          { model: Facilitator, as: 'facilitator' },
          { model: Cohort, as: 'cohort' }
        ]
      }]
    });

    logger.info(`Activity tracker ${id} updated by user ${req.user.id}`);

    res.json(updatedActivityTracker);
  } catch (error) {
    logger.error('Update activity tracker error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteActivityTracker = async (req, res) => {
  try {
    const { id } = req.params;
    
    let include = [{
      model: CourseOffering,
      as: 'courseOffering',
      where: { isActive: true }
    }];

    // Apply access control for facilitators
    if (req.user.role === 'facilitator') {
      include[0].where.facilitatorId = req.user.id;
    }

    const activityTracker = await ActivityTracker.findOne({
      where: { id },
      include
    });

    if (!activityTracker) {
      return res.status(404).json({ error: 'Activity tracker not found or access denied' });
    }

    await activityTracker.destroy();

    logger.info(`Activity tracker ${id} deleted by user ${req.user.id}`);

    res.json({ message: 'Activity tracker deleted successfully' });
  } catch (error) {
    logger.error('Delete activity tracker error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get activity summary for dashboard
const getActivitySummary = async (req, res) => {
  try {
    const { facilitatorId, startWeek, endWeek } = req.query;
    
    const where = {};
    let include = [{
      model: CourseOffering,
      as: 'courseOffering',
      where: { isActive: true },
      include: [
        { model: Module, as: 'module' },
        { model: Facilitator, as: 'facilitator' }
      ]
    }];

    // Apply filters
    if (startWeek) where.weekNumber = { [Op.gte]: parseInt(startWeek) };
    if (endWeek) where.weekNumber = { ...where.weekNumber, [Op.lte]: parseInt(endWeek) };
    
    if (req.user.role === 'facilitator') {
      include[0].where.facilitatorId = req.user.id;
    } else if (facilitatorId) {
      include[0].where.facilitatorId = facilitatorId;
    }

    const activityTrackers = await ActivityTracker.findAll({
      where,
      include,
      order: [['weekNumber', 'ASC']]
    });

    // Calculate summary statistics
    const summary = {
      totalLogs: activityTrackers.length,
      completedTasks: 0,
      pendingTasks: 0,
      notStartedTasks: 0,
      onTimeSubmissions: 0,
      lateSubmissions: 0,
      weeklyBreakdown: {}
    };

    activityTrackers.forEach(tracker => {
      const tasks = [
        tracker.formativeOneGrading,
        tracker.formativeTwoGrading,
        tracker.summativeGrading,
        tracker.courseModeration,
        tracker.intranetSync,
        tracker.gradeBookStatus
      ];

      tasks.forEach(task => {
        if (task === 'Done') summary.completedTasks++;
        else if (task === 'Pending') summary.pendingTasks++;
        else summary.notStartedTasks++;
      });

      // Check submission timeliness (assuming deadline is end of week)
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + (tracker.weekNumber - 1) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      if (tracker.submittedAt <= weekEnd) {
        summary.onTimeSubmissions++;
      } else {
        summary.lateSubmissions++;
      }

      // Weekly breakdown
      if (!summary.weeklyBreakdown[tracker.weekNumber]) {
        summary.weeklyBreakdown[tracker.weekNumber] = {
          week: tracker.weekNumber,
          totalTasks: 0,
          completedTasks: 0
        };
      }
      
      summary.weeklyBreakdown[tracker.weekNumber].totalTasks += tasks.length;
      summary.weeklyBreakdown[tracker.weekNumber].completedTasks += tasks.filter(t => t === 'Done').length;
    });

    res.json(summary);
  } catch (error) {
    logger.error('Get activity summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createActivityTracker,
  getActivityTrackers,
  getActivityTrackerById,
  updateActivityTracker,
  deleteActivityTracker,
  getActivitySummary
};