const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Course Management System API',
      version: '1.0.0',
      description: 'A comprehensive API for managing course allocations and tracking facilitator activities',
      contact: {
        name: 'API Support',
        email: 'support@coursemanagement.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:8000',
        description: 'Development server'
      },
      {
        url: 'https://api.coursemanagement.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from login endpoint'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'Error message'
                },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string' },
                      message: { type: 'string' },
                      value: { type: 'string' }
                    }
                  },
                  description: 'Validation error details'
                }
              }
            }
          }
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            currentPage: {
              type: 'integer',
              description: 'Current page number'
            },
            totalPages: {
              type: 'integer',
              description: 'Total number of pages'
            },
            totalItems: {
              type: 'integer',
              description: 'Total number of items'
            },
            itemsPerPage: {
              type: 'integer',
              description: 'Items per page'
            },
            hasNext: {
              type: 'boolean',
              description: 'Whether there is a next page'
            },
            hasPrev: {
              type: 'boolean',
              description: 'Whether there is a previous page'
            }
          }
        },
        Manager: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            userId: {
              type: 'string',
              format: 'uuid'
            },
            department: {
              type: 'string'
            },
            permissions: {
              type: 'object'
            },
            isActive: {
              type: 'boolean'
            }
          }
        },
        Facilitator: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            userId: {
              type: 'string',
              format: 'uuid'
            },
            employeeId: {
              type: 'string'
            },
            department: {
              type: 'string'
            },
            specializations: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            isActive: {
              type: 'boolean'
            },
            hireDate: {
              type: 'string',
              format: 'date'
            }
          }
        },
        Module: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            code: {
              type: 'string',
              description: 'Unique module code'
            },
            name: {
              type: 'string',
              description: 'Module name'
            },
            description: {
              type: 'string',
              description: 'Module description'
            },
            credits: {
              type: 'integer',
              minimum: 1,
              maximum: 20,
              description: 'Number of credits'
            },
            duration: {
              type: 'integer',
              description: 'Duration in weeks'
            },
            prerequisites: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'List of prerequisite module codes'
            },
            isActive: {
              type: 'boolean'
            }
          }
        },
        Cohort: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string',
              description: 'Cohort name'
            },
            description: {
              type: 'string'
            },
            startDate: {
              type: 'string',
              format: 'date'
            },
            endDate: {
              type: 'string',
              format: 'date'
            },
            maxStudents: {
              type: 'integer',
              minimum: 1
            },
            isActive: {
              type: 'boolean'
            }
          }
        },
        Class: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            code: {
              type: 'string',
              description: 'Class code (e.g., 2024S, 2025J)'
            },
            name: {
              type: 'string'
            },
            year: {
              type: 'integer',
              minimum: 2020,
              maximum: 2050
            },
            trimester: {
              type: 'string',
              enum: ['1', '2', '3']
            },
            isActive: {
              type: 'boolean'
            }
          }
        },
        Mode: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string',
              enum: ['online', 'in-person', 'hybrid']
            },
            description: {
              type: 'string'
            },
            isActive: {
              type: 'boolean'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './models/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

// Add additional route documentation
swaggerSpec.paths = {
  ...swaggerSpec.paths,
  '/health': {
    get: {
      summary: 'Health check endpoint',
      tags: ['System'],
      responses: {
        '200': {
          description: 'System is healthy',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'healthy'
                  },
                  timestamp: {
                    type: 'string',
                    format: 'date-time'
                  },
                  version: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

// Add common response examples
swaggerSpec.components.examples = {
  ValidationError: {
    value: {
      error: {
        message: 'Validation failed',
        details: [
          {
            field: 'email',
            message: 'Must be a valid email address',
            value: 'invalid-email'
          }
        ]
      }
    }
  },
  UnauthorizedError: {
    value: {
      error: {
        message: 'Authentication required'
      }
    }
  },
  ForbiddenError: {
    value: {
      error: {
        message: 'Insufficient permissions'
      }
    }
  },
  NotFoundError: {
    value: {
      error: {
        message: 'Resource not found'
      }
    }
  },
  InternalServerError: {
    value: {
      error: {
        message: 'Internal server error'
      }
    }
  }
};

module.exports = swaggerSpec;
