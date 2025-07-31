const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: {
        message: req.t('validation.validation_failed'),
        details: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      }
    });
  }
  
  next();
};

// Common validation rules
const validationRules = {
  // User validation
  userRegistration: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Must be a valid email address'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('firstName')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('First name must be between 1 and 100 characters'),
    body('lastName')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Last name must be between 1 and 100 characters'),
    body('role')
      .isIn(['manager', 'facilitator', 'student'])
      .withMessage('Role must be one of: manager, facilitator, student')
  ],

  userLogin: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Must be a valid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  // Module validation
  moduleCreation: [
    body('code')
      .trim()
      .isLength({ min: 1, max: 20 })
      .withMessage('Module code must be between 1 and 20 characters'),
    body('name')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Module name must be between 1 and 200 characters'),
    body('credits')
      .isInt({ min: 1, max: 20 })
      .withMessage('Credits must be between 1 and 20'),
    body('duration')
      .isInt({ min: 1 })
      .withMessage('Duration must be a positive integer')
  ],

  // Course offering validation
  courseOfferingCreation: [
    body('moduleId')
      .isUUID()
      .withMessage('Module ID must be a valid UUID'),
    body('facilitatorId')
      .isUUID()
      .withMessage('Facilitator ID must be a valid UUID'),
    body('cohortId')
      .isUUID()
      .withMessage('Cohort ID must be a valid UUID'),
    body('classId')
      .isUUID()
      .withMessage('Class ID must be a valid UUID'),
    body('modeId')
      .isUUID()
      .withMessage('Mode ID must be a valid UUID'),
    body('intakePeriod')
      .isIn(['HT1', 'HT2', 'FT'])
      .withMessage('Intake period must be one of: HT1, HT2, FT'),
    body('startDate')
      .isISO8601()
      .toDate()
      .withMessage('Start date must be a valid date'),
    body('endDate')
      .isISO8601()
      .toDate()
      .withMessage('End date must be a valid date'),
    body('maxStudents')
      .isInt({ min: 1 })
      .withMessage('Max students must be a positive integer')
  ],

  // Activity tracker validation
  activityTrackerCreation: [
    body('allocationId')
      .isUUID()
      .withMessage('Allocation ID must be a valid UUID'),
    body('weekNumber')
      .isInt({ min: 1, max: 52 })
      .withMessage('Week number must be between 1 and 52'),
    body('weekStartDate')
      .isISO8601()
      .toDate()
      .withMessage('Week start date must be a valid date'),
    body('weekEndDate')
      .isISO8601()
      .toDate()
      .withMessage('Week end date must be a valid date')
  ],

  activityTrackerUpdate: [
    body('attendance')
      .optional()
      .isArray()
      .withMessage('Attendance must be an array'),
    body('formativeOneGrading')
      .optional()
      .isIn(['Not Started', 'Pending', 'Done'])
      .withMessage('Formative one grading must be one of: Not Started, Pending, Done'),
    body('formativeTwoGrading')
      .optional()
      .isIn(['Not Started', 'Pending', 'Done'])
      .withMessage('Formative two grading must be one of: Not Started, Pending, Done'),
    body('summativeGrading')
      .optional()
      .isIn(['Not Started', 'Pending', 'Done'])
      .withMessage('Summative grading must be one of: Not Started, Pending, Done'),
    body('courseModeration')
      .optional()
      .isIn(['Not Started', 'Pending', 'Done'])
      .withMessage('Course moderation must be one of: Not Started, Pending, Done'),
    body('intranetSync')
      .optional()
      .isIn(['Not Started', 'Pending', 'Done'])
      .withMessage('Intranet sync must be one of: Not Started, Pending, Done'),
    body('gradeBookStatus')
      .optional()
      .isIn(['Not Started', 'Pending', 'Done'])
      .withMessage('Grade book status must be one of: Not Started, Pending, Done')
  ],

  // Query parameter validation
  paginationQuery: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],

  // UUID parameter validation
  uuidParam: (paramName) => [
    param(paramName)
      .isUUID()
      .withMessage(`${paramName} must be a valid UUID`)
  ]
};

module.exports = {
  handleValidationErrors,
  validationRules
};
