const redisClient = require('../config/redis');
const { Manager, User, ActivityTracker, CourseOffering, Facilitator } = require('../models');
const logger = require('../utils/logger');

const NOTIFICATION_QUEUES = {
  REMINDER: 'notification:reminder',
  ALERT: 'notification:alert',
  DEADLINE: 'notification:deadline'
};

const notificationService = {
  // Queue a notification
  queueNotification: async (type, data) => {
    try {
      const notification = {
        id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
        timestamp: new Date().toISOString(),
        attempts: 0,
        maxAttempts: 3
      };

      await redisClient.lpush(NOTIFICATION_QUEUES[type], JSON.stringify(notification));
      logger.info(`Notification queued: ${type} - ${notification.id}`);
      
      return notification.id;
    } catch (error) {
      logger.error('Error queueing notification:', error);
      throw error;
    }
  },

  // Send reminder to facilitators for missing activity logs
  sendActivityLogReminder: async (facilitatorId, weekNumber) => {
    try {
      const facilitator = await Facilitator.findByPk(facilitatorId, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email']
        }]
      });

      if (!facilitator) {
        throw new Error(`Facilitator not found: ${facilitatorId}`);
      }

      const notificationData = {
        recipient: {
          id: facilitator.userId,
          email: facilitator.user.email,
          name: `${facilitator.user.firstName} ${facilitator.user.lastName}`
        },
        message: {
          subject: 'Activity Log Reminder',
          body: `Dear ${facilitator.user.firstName}, you have not submitted your activity log for week ${weekNumber}. Please submit it as soon as possible.`,
          priority: 'normal'
        },
        metadata: {
          facilitatorId,
          weekNumber,
          type: 'activity_log_reminder'
        }
      };

      return await this.queueNotification('REMINDER', notificationData);
    } catch (error) {
      logger.error('Error sending activity log reminder:', error);
      throw error;
    }
  },

  // Send deadline alert to managers
  sendDeadlineAlert: async (missedDeadlines) => {
    try {
      const managers = await Manager.findAll({
        where: { isActive: true },
        include: [{
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email']
        }]
      });

      for (const manager of managers) {
        const notificationData = {
          recipient: {
            id: manager.userId,
            email: manager.user.email,
            name: `${manager.user.firstName} ${manager.user.lastName}`
          },
          message: {
            subject: 'Activity Log Deadline Alert',
            body: `${missedDeadlines.length} facilitator(s) have missed activity log submission deadlines. Please review and take appropriate action.`,
            priority: 'high'
          },
          metadata: {
            missedDeadlines,
            type: 'deadline_alert'
          }
        };

        await this.queueNotification('ALERT', notificationData);
      }

      return true;
    } catch (error) {
      logger.error('Error sending deadline alert:', error);
      throw error;
    }
  },

  // Notify managers when activity log is submitted
  notifyActivityLogSubmission: async (activityLog, facilitator) => {
    try {
      const managers = await Manager.findAll({
        where: { isActive: true },
        include: [{
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email']
        }]
      });

      for (const manager of managers) {
        const notificationData = {
          recipient: {
            id: manager.userId,
            email: manager.user.email,
            name: `${manager.user.firstName} ${manager.user.lastName}`
          },
          message: {
            subject: 'Activity Log Submitted',
            body: `${facilitator.firstName} ${facilitator.lastName} has submitted an activity log for week ${activityLog.weekNumber} in ${activityLog.courseOffering.module.name}.`,
            priority: 'normal'
          },
          metadata: {
            activityLogId: activityLog.id,
            facilitatorId: facilitator.facilitatorProfile.id,
            weekNumber: activityLog.weekNumber,
            type: 'activity_log_submission'
          }
        };

        await this.queueNotification('ALERT', notificationData);
      }

      return true;
    } catch (error) {
      logger.error('Error notifying activity log submission:', error);
      throw error;
    }
  },

  // Check for overdue activity logs and send alerts
  checkOverdueActivityLogs: async () => {
    try {
      const currentDate = new Date();
      const overdueThreshold = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 days ago

      // Find activity logs that are overdue (week ended but not submitted)
      const overdueLogs = await ActivityTracker.findAll({
        where: {
          submittedAt: null,
          weekEndDate: {
            [require('sequelize').Op.lt]: overdueThreshold
          }
        },
        include: [
          {
            model: CourseOffering,
            as: 'courseOffering',
            include: [{
              model: require('../models').Module,
              as: 'module'
            }]
          },
          {
            model: Facilitator,
            as: 'facilitator',
            include: [{
              model: User,
              as: 'user'
            }]
          }
        ]
      });

      if (overdueLogs.length > 0) {
        // Group by facilitator
        const facilitatorGroups = overdueLogs.reduce((groups, log) => {
          const facilitatorId = log.facilitatorId;
          if (!groups[facilitatorId]) {
            groups[facilitatorId] = {
              facilitator: log.facilitator,
              logs: []
            };
          }
          groups[facilitatorId].logs.push(log);
          return groups;
        }, {});

        // Send reminders to facilitators
        for (const [facilitatorId, group] of Object.entries(facilitatorGroups)) {
          for (const log of group.logs) {
            await this.sendActivityLogReminder(facilitatorId, log.weekNumber);
          }
        }

        // Send alert to managers
        await this.sendDeadlineAlert(overdueLogs);

        logger.info(`Processed ${overdueLogs.length} overdue activity logs`);
      }

      return overdueLogs.length;
    } catch (error) {
      logger.error('Error checking overdue activity logs:', error);
      throw error;
    }
  },

  // Process notification queue
  processNotificationQueue: async (queueName) => {
    try {
      const notification = await redisClient.brpop(queueName, 0);
      
      if (notification) {
        const notificationData = JSON.parse(notification[1]);
        
        // Simulate sending notification (email, SMS, etc.)
        logger.info(`Processing notification: ${notificationData.id}`);
        logger.info(`To: ${notificationData.data.recipient.email}`);
        logger.info(`Subject: ${notificationData.data.message.subject}`);
        logger.info(`Body: ${notificationData.data.message.body}`);
        
        // In a real implementation, you would integrate with email service like SendGrid, SES, etc.
        // await emailService.send(notificationData.data);
        
        // Log successful delivery
        await this.logNotificationDelivery(notificationData.id, 'delivered');
        
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error processing notification queue:', error);
      throw error;
    }
  },

  // Log notification delivery results
  logNotificationDelivery: async (notificationId, status, error = null) => {
    try {
      const logKey = `notification_log:${notificationId}`;
      const logData = {
        id: notificationId,
        status,
        timestamp: new Date().toISOString(),
        error: error ? error.message : null
      };

      await redisClient.setex(logKey, 86400 * 7, JSON.stringify(logData)); // Keep for 7 days
      logger.info(`Notification delivery logged: ${notificationId} - ${status}`);
    } catch (error) {
      logger.error('Error logging notification delivery:', error);
    }
  },

  // Get notification delivery status
  getNotificationStatus: async (notificationId) => {
    try {
      const logKey = `notification_log:${notificationId}`;
      const logData = await redisClient.get(logKey);
      
      return logData ? JSON.parse(logData) : null;
    } catch (error) {
      logger.error('Error getting notification status:', error);
      return null;
    }
  }
};

module.exports = notificationService;
