const Bull = require('bull');
const nodemailer = require('nodemailer');
const redisClient = require('../config/redis');
const logger = require('../utils/logger');
const { ActivityTracker, CourseOffering, Facilitator, Manager } = require('../models');

// Create Bull queues
const emailQueue = new Bull('email queue', {
  redis: {
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST || 'localhost',
    password: process.env.REDIS_PASSWORD || undefined
  }
});

const reminderQueue = new Bull('reminder queue', {
  redis: {
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST || 'localhost',
    password: process.env.REDIS_PASSWORD || undefined
  }
});

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Process email queue
emailQueue.process(async (job) => {
  const { to, subject, text, html } = job.data;
  
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html
    });
    
    logger.info(`Email sent successfully to ${to}`, { messageId: info.messageId });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);
    throw error;
  }
});

// Process reminder queue
reminderQueue.process(async (job) => {
  const { type } = job.data;
  
  try {
    if (type === 'weekly_reminder') {
      await sendWeeklyReminders();
    } else if (type === 'deadline_alert') {
      await sendDeadlineAlerts();
    }
    
    return { success: true };
  } catch (error) {
    logger.error('Failed to process reminder:', error);
    throw error;
  }
});

// Send weekly reminders to facilitators
const sendWeeklyReminders = async () => {
  const currentWeek = getCurrentWeek();
  const facilitators = await Facilitator.findAll({
    where: { isActive: true },
    include: [{
      model: CourseOffering,
      as: 'courseOfferings',
      where: { isActive: true },
      include: [{
        model: ActivityTracker,
        as: 'activityTrackers',
        where: { weekNumber: currentWeek },
        required: false
      }]
    }]
  });

  for (const facilitator of facilitators) {
    const pendingCourses = facilitator.courseOfferings.filter(course => 
      !course.activityTrackers.length || 
      course.activityTrackers.some(tracker => 
        tracker.formativeOneGrading === 'Not Started' ||
        tracker.formativeTwoGrading === 'Not Started' ||
        tracker.summativeGrading === 'Not Started'
      )
    );

    if (pendingCourses.length > 0) {
      await emailQueue.add('send_reminder', {
        to: facilitator.email,
        subject: `Weekly Activity Log Reminder - Week ${currentWeek}`,
        text: `Dear ${facilitator.firstName},\n\nThis is a reminder to submit your weekly activity logs for week ${currentWeek}.\n\nPending courses: ${pendingCourses.length}\n\nPlease log in to the system to update your activities.`,
        html: `
          <h2>Weekly Activity Log Reminder</h2>
          <p>Dear ${facilitator.firstName},</p>
          <p>This is a reminder to submit your weekly activity logs for week ${currentWeek}.</p>
          <p><strong>Pending courses:</strong> ${pendingCourses.length}</p>
          <p>Please log in to the system to update your activities.</p>
        `
      });
    }
  }
};

// Send deadline alerts to managers
const sendDeadlineAlerts = async () => {
  const currentWeek = getCurrentWeek();
  const overdueLogs = await ActivityTracker.findAll({
    where: {
      weekNumber: { [require('sequelize').Op.lt]: currentWeek },
      submittedAt: null
    },
    include: [{
      model: CourseOffering,
      as: 'courseOffering',
      include: [
        { model: Facilitator, as: 'facilitator' },
        { model: Manager, as: 'creator' }
      ]
    }]
  });

  // Group by manager
  const managerAlerts = {};
  overdueLogs.forEach(log => {
    const managerId = log.courseOffering.createdBy;
    if (!managerAlerts[managerId]) {
      managerAlerts[managerId] = {
        manager: log.courseOffering.creator,
        overdueLogs: []
      };
    }
    managerAlerts[managerId].overdueLogs.push(log);
  });

  // Send alerts to managers
  for (const [managerId, alert] of Object.entries(managerAlerts)) {
    await emailQueue.add('send_alert', {
      to: alert.manager.email,
      subject: `Overdue Activity Logs Alert`,
      text: `Dear ${alert.manager.firstName},\n\nThere are ${alert.overdueLogs.length} overdue activity logs that require attention.\n\nPlease review the system for details.`,
      html: `
        <h2>Overdue Activity Logs Alert</h2>
        <p>Dear ${alert.manager.firstName},</p>
        <p>There are <strong>${alert.overdueLogs.length}</strong> overdue activity logs that require attention.</p>
        <ul>
          ${alert.overdueLogs.map(log => `
            <li>
              Week ${log.weekNumber} - ${log.courseOffering.facilitator.firstName} ${log.courseOffering.facilitator.lastName}
              (${log.courseOffering.module?.moduleName || 'Module'})
            </li>
          `).join('')}
        </ul>
        <p>Please review the system for details.</p>
      `
    });
  }
};

// Helper function to get current week number
const getCurrentWeek = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + start.getDay() + 1) / 7);
};

// Schedule recurring jobs
const scheduleRecurringJobs = () => {
  // Send weekly reminders every Monday at 9 AM
  reminderQueue.add('weekly_reminder', {}, {
    repeat: { cron: '0 9 * * 1' }
  });

  // Send deadline alerts every day at 6 PM
  reminderQueue.add('deadline_alert', {}, {
    repeat: { cron: '0 18 * * *' }
  });
};

module.exports = {
  emailQueue,
  reminderQueue,
  scheduleRecurringJobs,
  sendWeeklyReminders,
  sendDeadlineAlerts
};