const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

class NotificationWorker {
  constructor() {
    this.isRunning = false;
    this.workers = [];
    this.overdueCheckInterval = null;
  }

  // Start the notification worker
  start() {
    if (this.isRunning) {
      logger.warn('Notification worker is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting notification worker...');

    // Start workers for different queue types
    this.startQueueWorker('REMINDER');
    this.startQueueWorker('ALERT');
    this.startQueueWorker('DEADLINE');

    // Start periodic overdue check (every hour)
    this.startOverdueCheck();

    logger.info('Notification worker started successfully');
  }

  // Stop the notification worker
  stop() {
    if (!this.isRunning) {
      logger.warn('Notification worker is not running');
      return;
    }

    this.isRunning = false;
    logger.info('Stopping notification worker...');

    // Stop all workers
    this.workers.forEach(worker => {
      if (worker.kill) {
        worker.kill();
      }
    });
    this.workers = [];

    // Stop overdue check
    if (this.overdueCheckInterval) {
      clearInterval(this.overdueCheckInterval);
      this.overdueCheckInterval = null;
    }

    logger.info('Notification worker stopped');
  }

  // Start a worker for a specific queue
  startQueueWorker(queueType) {
    const queueName = `notification:${queueType.toLowerCase()}`;
    
    const worker = setInterval(async () => {
      if (!this.isRunning) return;

      try {
        await notificationService.processNotificationQueue(queueName);
      } catch (error) {
        logger.error(`Error in ${queueType} queue worker:`, error);
      }
    }, 5000); // Check every 5 seconds

    this.workers.push({
      type: queueType,
      interval: worker,
      kill: () => clearInterval(worker)
    });

    logger.info(`${queueType} queue worker started`);
  }

  // Start periodic overdue activity log check
  startOverdueCheck() {
    // Run immediately and then every hour
    this.checkOverdueActivityLogs();
    
    this.overdueCheckInterval = setInterval(() => {
      if (!this.isRunning) return;
      this.checkOverdueActivityLogs();
    }, 60 * 60 * 1000); // Every hour

    logger.info('Overdue activity log check started (hourly)');
  }

  // Check for overdue activity logs
  async checkOverdueActivityLogs() {
    try {
      logger.info('Checking for overdue activity logs...');
      const overdueCount = await notificationService.checkOverdueActivityLogs();
      
      if (overdueCount > 0) {
        logger.info(`Found ${overdueCount} overdue activity logs, notifications sent`);
      } else {
        logger.info('No overdue activity logs found');
      }
    } catch (error) {
      logger.error('Error checking overdue activity logs:', error);
    }
  }

  // Get worker status
  getStatus() {
    return {
      isRunning: this.isRunning,
      workers: this.workers.map(worker => ({
        type: worker.type,
        isActive: !!worker.interval
      })),
      overdueCheckActive: !!this.overdueCheckInterval
    };
  }

  // Manual trigger for testing
  async triggerOverdueCheck() {
    if (!this.isRunning) {
      throw new Error('Worker is not running');
    }
    
    return await this.checkOverdueActivityLogs();
  }

  // Process specific queue manually
  async processQueue(queueType) {
    if (!this.isRunning) {
      throw new Error('Worker is not running');
    }

    const queueName = `notification:${queueType.toLowerCase()}`;
    return await notificationService.processNotificationQueue(queueName);
  }
}

// Export singleton instance
const notificationWorker = new NotificationWorker();

// Handle process signals for graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, stopping notification worker');
  notificationWorker.stop();
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, stopping notification worker');
  notificationWorker.stop();
});

module.exports = notificationWorker;
