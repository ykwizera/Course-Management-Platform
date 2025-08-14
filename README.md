# Course Management System

## Overview

This is a comprehensive Course Management System designed to handle course allocations and track facilitator activities. The system consists of two main modules:

1. **Course Allocation System** - Manages the assignment of facilitators to courses for specific cohorts, trimesters, and intake periods
2. **Facilitator Activity Tracker (FAT)** - Tracks weekly activities by facilitators including attendance, grading, and moderation
3. **Student Reflection Page**
   
   **1. Github Link to Module 3:** https://github.com/ykwizera/Student-Reflection-Page-with-i18n-l10n-Support.git 

    **2. App Link:** https://reflectionpage.netlify.app/
 4. **Video walkthrough**  https://youtu.be/0_DO-GgXh-M
## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a layered architecture pattern with clear separation of concerns:

- **Presentation Layer**: RESTful API endpoints with Swagger documentation
- **Business Logic Layer**: Controllers handling request processing and business rules
- **Data Access Layer**: Sequelize ORM with MySQL database
- **Infrastructure Layer**: Authentication, validation, logging, and notification services

## Key Components

### Backend Framework
- **Express.js** - Web framework for building RESTful APIs
- **Node.js** - Runtime environment

### Database
- **MySQL** - Primary relational database using Sequelize ORM
- **Sequelize** - Object-relational mapping for database operations
- Soft deletes enabled (paranoid mode)
- UTC timezone for consistent datetime handling

### Authentication & Security
- **JWT (JSON Web Tokens)** - Stateless authentication mechanism
- **bcrypt** - Password hashing for secure storage
- **Role-based access control** - Manager, Facilitator, and Student roles
- **Security middleware**:
  - Helmet for security headers
  - CORS for cross-origin resource sharing
  - Rate limiting to prevent abuse

### Data Models
Core entities with UUID primary keys:
- **User** - Base user accounts with roles
- **Manager/Facilitator/Student** - Role-specific profiles
- **Module** - Course definitions
- **CourseOffering** - Course allocations linking modules to facilitators
- **ActivityTracker** - Weekly activity logs for facilitators
- **Cohort/Class/Mode** - Supporting entities for course organization

### Validation & Input Processing
- **express-validator** - Request validation middleware
- **Custom validators** - Email, password strength, UUID, date validation
- Comprehensive error handling with internationalized messages

### Notification System
- **Redis** - Message queue for notification processing
- **Background workers** - Process notification queues asynchronously
- **Automated reminders** - For missing activity log submissions
- **Manager alerts** - For compliance monitoring

### Internationalization
- **i18next** - Multi-language support (English and Spanish)
- **File-based translations** - JSON translation files
- **Automatic language detection** - From headers, query parameters, or cookies

### Testing
- **Jest** - Testing framework for unit tests
- Test coverage for models and utility functions
- Database setup scripts for test environments

### API Documentation
- **Swagger/OpenAPI** - Interactive API documentation
- **swagger-jsdoc** - Generate docs from JSDoc comments
- **swagger-ui-express** - Serve documentation interface

### Logging
- **Winston** - Structured logging with multiple transports
- **Log levels** - Error, warn, info, http, debug
- **File and console outputs** - Separate formats for different environments

## Data Flow

1. **Authentication Flow**:
   - User registers/logs in → JWT token generated → Token validates requests → Role-based access control

2. **Course Allocation Flow**:
   - Manager creates course offerings → Links modules to facilitators → Associates with cohorts and classes

3. **Activity Tracking Flow**:
   - Facilitators submit weekly logs → System validates submissions → Notifications queued for missing logs → Managers receive alerts

4. **Notification Flow**:
   - Events trigger notifications → Redis queues messages → Background workers process → Email/alerts sent

## External Dependencies

### Core Dependencies
- **bcrypt** - Password hashing
- **cors** - Cross-origin resource sharing
- **express** - Web framework
- **express-rate-limit** - Rate limiting
- **express-validator** - Input validation
- **helmet** - Security middleware
- **jsonwebtoken** - JWT authentication
- **mysql2** - MySQL database driver
- **redis** - Redis client for queuing
- **sequelize** - ORM for database operations
- **winston** - Logging framework

### Development Dependencies
- **jest** - Testing framework
- **nodemon** - Development server with auto-restart

### API & Documentation
- **swagger-jsdoc** - API documentation generation
- **swagger-ui-express** - API documentation interface

### Internationalization
- **i18next** - Internationalization framework
- **i18next-fs-backend** - File system backend for translations
- **i18next-http-middleware** - HTTP middleware for language detection

## Deployment Strategy

### Environment Configuration
- **Environment variables** for database, Redis, and JWT configuration
- **Configurable CORS origins** for different deployment environments
- **Logging levels** adjustable per environment

### Database Setup
- **Migration scripts** for initial database setup
- **Seed data scripts** for development and testing
- **Soft delete implementation** for data retention

### Production Considerations
- **Rate limiting** implemented to prevent abuse
- **Security headers** via Helmet middleware
- **Structured logging** for monitoring and debugging
- **Connection pooling** for database performance
- **Redis retry strategies** for resilient queue processing

### Scalability Features
- **Stateless authentication** with JWT tokens
- **Redis-based queuing** for async notification processing
- **Background workers** can be scaled independently
- **Database connection pooling** for concurrent requests
