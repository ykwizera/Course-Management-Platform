const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

const schemas = {
  courseOffering: Joi.object({
    moduleId: Joi.number().integer().positive().required(),
    facilitatorId: Joi.number().integer().positive().required(),
    cohortId: Joi.number().integer().positive().required(),
    classId: Joi.number().integer().positive().required(),
    modeId: Joi.number().integer().positive().required(),
    trimester: Joi.string().required(),
    intakePeriod: Joi.string().valid('HT1', 'HT2', 'FT').required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().greater(Joi.ref('startDate')).required(),
    maxStudents: Joi.number().integer().positive().optional()
  }),

  activityTracker: Joi.object({
    allocationId: Joi.number().integer().positive().required(),
    weekNumber: Joi.number().integer().min(1).max(52).required(),
    attendance: Joi.array().items(Joi.boolean()).optional(),
    formativeOneGrading: Joi.string().valid('Done', 'Pending', 'Not Started').optional(),
    formativeTwoGrading: Joi.string().valid('Done', 'Pending', 'Not Started').optional(),
    summativeGrading: Joi.string().valid('Done', 'Pending', 'Not Started').optional(),
    courseModeration: Joi.string().valid('Done', 'Pending', 'Not Started').optional(),
    intranetSync: Joi.string().valid('Done', 'Pending', 'Not Started').optional(),
    gradeBookStatus: Joi.string().valid('Done', 'Pending', 'Not Started').optional(),
    notes: Joi.string().optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  })
};

module.exports = {
  validateRequest,
  schemas
};