#!/usr/bin/env node

/**
 * Database Setup Script
 * 
 * This script sets up the database for the Course Management System.
 * It can be used for initial setup, seeding test data, or resetting the database.
 * 
 * Usage:
 *   node scripts/dbSetup.js [options]
 * 
 * Options:
 *   --reset     Drop all tables and recreate them
 *   --seed      Add seed data for development/testing
 *   --force     Force operations without confirmation prompts
 *   --env       Environment (development|test|production)
 */

const { sequelize } = require('../models');
const {
  User,
  Manager,
  Facilitator,
  Student,
  Module,
  Cohort,
  Class,
  Mode,
  CourseOffering,
  ActivityTracker
} = require('../models');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');

// Command line arguments
const args = process.argv.slice(2);
const options = {
  reset: args.includes('--reset'),
  seed: args.includes('--seed'),
  force: args.includes('--force'),
  env: getEnvOption() || process.env.NODE_ENV || 'development'
};

function getEnvOption() {
  const envIndex = args.findIndex(arg => arg === '--env');
  return envIndex !== -1 && args[envIndex + 1] ? args[envIndex + 1] : null;
}

// Seed data templates
const seedData = {
  modes: [
    { name: 'online', description: 'Online delivery mode', isActive: true },
    { name: 'in-person', description: 'In-person delivery mode', isActive: true },
    { name: 'hybrid', description: 'Hybrid delivery mode', isActive: true }
  ],

  modules: [
    {
      code: 'CS101',
      name: 'Introduction to Computer Science',
      description: 'Fundamental concepts of computer science and programming',
      credits: 3,
      duration: 12,
      prerequisites: [],
      isActive: true
    },
    {
      code: 'CS102',
      name: 'Data Structures and Algorithms',
      description: 'Basic data structures and algorithmic problem solving',
      credits: 4,
      duration: 14,
      prerequisites: ['CS101'],
      isActive: true
    },
    {
      code: 'WEB201',
      name: 'Web Development Fundamentals',
      description: 'HTML, CSS, JavaScript and responsive web design',
      credits: 3,
      duration: 10,
      prerequisites: [],
      isActive: true
    },
    {
      code: 'DB301',
      name: 'Database Design and Management',
      description: 'Relational database design, SQL, and database administration',
      credits: 4,
      duration: 16,
      prerequisites: ['CS101'],
      isActive: true
    }
  ],

  cohorts: [
    {
      name: 'Cohort 2024A',
      description: 'Spring 2024 intake cohort',
      startDate: '2024-02-01',
      endDate: '2024-11-30',
      maxStudents: 30,
      isActive: true
    },
    {
      name: 'Cohort 2024B',
      description: 'Summer 2024 intake cohort',
      startDate: '2024-06-01',
      endDate: '2025-03-31',
      maxStudents: 25,
      isActive: true
    },
    {
      name: 'Cohort 2024C',
      description: 'Fall 2024 intake cohort',
      startDate: '2024-09-01',
      endDate: '2025-06-30',
      maxStudents: 35,
      isActive: true
    }
  ],

  classes: [
    {
      code: '2024S',
      name: 'Spring 2024',
      year: 2024,
      trimester: '1',
      isActive: true
    },
    {
      code: '2024M',
      name: 'Summer 2024',
      year: 2024,
      trimester: '2',
      isActive: true
    },
    {
      code: '2024F',
      name: 'Fall 2024',
      year: 2024,
      trimester: '3',
      isActive: true
    },
    {
      code: '2025S',
      name: 'Spring 2025',
      year: 2025,
      trimester: '1',
      isActive: true
    }
  ],

  users: [
    {
      email: 'admin@coursemanagement.com',
      password: 'Admin123!',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'manager',
      isActive: true,
      profile: {
        department: 'Administration',
        permissions: {
          canManageCourseAllocations: true,
          canViewAllActivityLogs: true,
          canManageFacilitators: true,
          canGenerateReports: true,
          canManageUsers: true
        }
      }
    },
    {
      email: 'john.manager@coursemanagement.com',
      password: 'Manager123!',
      firstName: 'John',
      lastName: 'Manager',
      role: 'manager',
      isActive: true,
      profile: {
        department: 'Academic Affairs'
      }
    },
    {
      email: 'jane.facilitator@coursemanagement.com',
      password: 'Facilitator123!',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'facilitator',
      isActive: true,
      profile: {
        employeeId: 'FAC001',
        department: 'Computer Science',
        specializations: ['Web Development', 'Database Systems'],
        hireDate: '2023-01-15'
      }
    },
    {
      email: 'bob.facilitator@coursemanagement.com',
      password: 'Facilitator123!',
      firstName: 'Bob',
      lastName: 'Johnson',
      role: 'facilitator',
      isActive: true,
      profile: {
        employeeId: 'FAC002',
        department: 'Computer Science',
        specializations: ['Programming', 'Algorithms'],
        hireDate: '2023-03-01'
      }
    },
    {
      email: 'alice.student@coursemanagement.com',
      password: 'Student123!',
      firstName: 'Alice',
      lastName: 'Williams',
      role: 'student',
      isActive: true,
      profile: {
        studentId: 'STU001',
        enrollmentDate: '2024-02-01'
      }
    }
  ]
};

/**
 * Main setup function
 */
async function setupDatabase() {
  try {
    logger.info(`Starting database setup for ${options.env} environment`);
    
    // Confirm destructive operations
    if (options.reset && !options.force) {
      const confirm = await confirmAction('This will drop all existing data. Continue?');
      if (!confirm) {
        logger.info('Setup cancelled by user');
        process.exit(0);
      }
    }

    // Test database connection
    await testConnection();

    // Reset database if requested
    if (options.reset) {
      await resetDatabase();
    }

    // Sync models (create tables)
    await syncModels();

    // Seed data if requested
    if (options.seed) {
      await seedDatabase();
    }

    logger.info('Database setup completed successfully');
    
  } catch (error) {
    logger.error('Database setup failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

/**
 * Test database connection
 */
async function testConnection() {
  logger.info('Testing database connection...');
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
  } catch (error) {
    throw new Error(`Unable to connect to database: ${error.message}`);
  }
}

/**
 * Reset database (drop all tables)
 */
async function resetDatabase() {
  logger.info('Resetting database...');
  
  try {
    await sequelize.drop();
    logger.info('All tables dropped successfully');
  } catch (error) {
    throw new Error(`Failed to reset database: ${error.message}`);
  }
}

/**
 * Sync models (create tables)
 */
async function syncModels() {
  logger.info('Creating database tables...');
  
  try {
    await sequelize.sync({ force: options.reset });
    logger.info('Database tables created successfully');
  } catch (error) {
    throw new Error(`Failed to sync models: ${error.message}`);
  }
}

/**
 * Seed database with test data
 */
async function seedDatabase() {
  logger.info('Seeding database with test data...');
  
  try {
    // Create modes
    logger.info('Creating modes...');
    const modes = await Mode.bulkCreate(seedData.modes);
    logger.info(`Created ${modes.length} modes`);

    // Create modules
    logger.info('Creating modules...');
    const modules = await Module.bulkCreate(seedData.modules);
    logger.info(`Created ${modules.length} modules`);

    // Create cohorts
    logger.info('Creating cohorts...');
    const cohorts = await Cohort.bulkCreate(seedData.cohorts);
    logger.info(`Created ${cohorts.length} cohorts`);

    // Create classes
    logger.info('Creating classes...');
    const classes = await Class.bulkCreate(seedData.classes);
    logger.info(`Created ${classes.length} classes`);

    // Create users with profiles
    logger.info('Creating users and profiles...');
    let userCount = 0;
    
    for (const userData of seedData.users) {
      const { profile, ...userInfo } = userData;
      
      // Create user
      const user = await User.create(userInfo);
      userCount++;
      
      // Create role-specific profile
      if (user.role === 'manager' && profile) {
        await Manager.create({
          userId: user.id,
          ...profile
        });
      } else if (user.role === 'facilitator' && profile) {
        await Facilitator.create({
          userId: user.id,
          ...profile
        });
      } else if (user.role === 'student' && profile) {
        await Student.create({
          userId: user.id,
          ...profile,
          cohortId: cohorts[0].id // Assign to first cohort
        });
      }
    }
    
    logger.info(`Created ${userCount} users with profiles`);

    // Create sample course offerings
    logger.info('Creating sample course offerings...');
    const facilitators = await Facilitator.findAll();
    
    if (facilitators.length > 0) {
      const courseOfferings = [
        {
          moduleId: modules[0].id,
          facilitatorId: facilitators[0].id,
          cohortId: cohorts[0].id,
          classId: classes[0].id,
          modeId: modes[0].id,
          intakePeriod: 'HT1',
          startDate: '2024-02-05',
          endDate: '2024-05-15',
          maxStudents: 25,
          status: 'active'
        },
        {
          moduleId: modules[1].id,
          facilitatorId: facilitators[1] ? facilitators[1].id : facilitators[0].id,
          cohortId: cohorts[0].id,
          classId: classes[0].id,
          modeId: modes[1].id,
          intakePeriod: 'HT2',
          startDate: '2024-03-01',
          endDate: '2024-06-15',
          maxStudents: 30,
          status: 'planned'
        }
      ];

      const offerings = await CourseOffering.bulkCreate(courseOfferings);
      logger.info(`Created ${offerings.length} course offerings`);

      // Create sample activity trackers
      logger.info('Creating sample activity trackers...');
      const activityTrackers = [
        {
          allocationId: offerings[0].id,
          facilitatorId: facilitators[0].id,
          weekNumber: 1,
          weekStartDate: '2024-02-05',
          weekEndDate: '2024-02-11',
          formativeOneGrading: 'Done',
          formativeTwoGrading: 'Pending',
          attendance: [true, true, false, true, true],
          submittedAt: new Date()
        },
        {
          allocationId: offerings[0].id,
          facilitatorId: facilitators[0].id,
          weekNumber: 2,
          weekStartDate: '2024-02-12',
          weekEndDate: '2024-02-18',
          formativeOneGrading: 'Not Started',
          attendance: [true, true, true, false, true]
        }
      ];

      const trackers = await ActivityTracker.bulkCreate(activityTrackers);
      logger.info(`Created ${trackers.length} activity trackers`);
    }

    logger.info('Database seeding completed successfully');
    
  } catch (error) {
    throw new Error(`Failed to seed database: ${error.message}`);
  }
}

/**
 * Confirm user action
 */
async function confirmAction(message) {
  if (options.force) return true;
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Display usage information
 */
function displayUsage() {
  console.log(`
Database Setup Script for Course Management System

Usage: node scripts/dbSetup.js [options]

Options:
  --reset     Drop all tables and recreate them (DESTRUCTIVE)
  --seed      Add seed data for development/testing
  --force     Force operations without confirmation prompts
  --env       Environment (development|test|production)
  --help      Display this help message

Examples:
  node scripts/dbSetup.js --seed
  node scripts/dbSetup.js --reset --seed --force
  node scripts/dbSetup.js --env test --reset --seed

Warning: --reset will permanently delete all existing data!
  `);
}

// Handle help option
if (args.includes('--help') || args.includes('-h')) {
  displayUsage();
  process.exit(0);
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = {
  setupDatabase,
  testConnection,
  resetDatabase,
  syncModels,
  seedDatabase
};
