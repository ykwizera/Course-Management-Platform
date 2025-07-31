const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const logger = require('./utils/logger');

const app = express();

// Initialize i18n
i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    backend: {
      loadPath: './locales/{{lng}}.json'
    },
    detection: {
      order: ['header', 'querystring'],
      caches: false
    }
  });

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(middleware.handle(i18next));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Step 1: Try adding models
console.log('Loading models...');
const { sequelize } = require('./models');

// Step 2: Try adding auth routes
console.log('Loading auth routes...');
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Step 3: Try adding course allocation routes
console.log('Loading course allocation routes...');
const courseAllocationRoutes = require('./routes/courseAllocations');
app.use('/api/course-allocations', courseAllocationRoutes);

// Step 4: Try adding activity log routes
console.log('Loading activity log routes...');
const activityLogRoutes = require('./routes/activityLogs');
app.use('/api/activity-logs', activityLogRoutes);

// Step 5: Try adding Swagger
console.log('Loading Swagger...');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Step 6: Try adding notification worker
console.log('Loading notification worker...');
// const notificationWorker = require('./workers/notificationWorker');

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: {
      message: req.t ? req.t('errors.internal_server_error') : 'Internal server error',
      timestamp: new Date().toISOString()
    }
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: req.t ? req.t('errors.route_not_found') : 'Route not found',
      path: req.originalUrl
    }
  });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Database connection
console.log('Testing database connection...');

async function startServer() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    
    app.listen(PORT, HOST, () => {
      logger.info(`Course Management API running on ${HOST}:${PORT}`);
      logger.info(`Swagger documentation available at http://${HOST}:${PORT}/api-docs`);
      logger.info(`Health check available at http://${HOST}:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer();