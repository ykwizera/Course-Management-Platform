// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// ===== Swagger =====
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Course Allocation System API',
      version: '1.0.0',
      description: 'API documentation for the Course Allocation System'
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 5000}` }]
  },
  apis: ['./routes/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ===== Helper: safe route mount (prevents MODULE_NOT_FOUND crashes) =====
function mountRouteIfExists(relativeFile, mountPoint) {
  const fullPath = path.join(__dirname, 'routes', relativeFile);
  if (fs.existsSync(fullPath)) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const router = require(fullPath);
    app.use(mountPoint, router);
    console.log(`✅ Mounted ${mountPoint} -> routes/${relativeFile}`);
  } else {
    console.warn(`⚠️  Skipped: routes/${relativeFile} not found. (${mountPoint})`);
  }
}

mountRouteIfExists('auth.js', '/api/auth');
mountRouteIfExists('courseOfferings.js', '/api/courses');      
mountRouteIfExists('activityTrackers.js', '/api/logs');            
mountRouteIfExists('modules.js', '/api/modules');
mountRouteIfExists('modes.js', '/api/modes');
mountRouteIfExists('classes.js', '/api/classes');
mountRouteIfExists('cohorts.js', '/api/cohorts');
mountRouteIfExists('studentRoutes.js', '/api/studentRoutes'); 


app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('Course Allocation System API is running...');
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err?.stack || err?.message || err);
  res.status(500).json({ error: 'Internal server error' });
});

// ===== Start Server =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📄 Swagger docs at http://localhost:${PORT}/api-docs`);
});
