const { User, Manager, Facilitator, Student } = require('../models');
const { generateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { email, password, firstName, lastName, role, ...profileData } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          error: {
            message: req.t('auth.user_already_exists')
          }
        });
      }

      // Create user
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        role
      });

      // Create role-specific profile
      let profile = null;
      switch (role) {
        case 'manager':
          profile = await Manager.create({
            userId: user.id,
            ...profileData
          });
          break;
        case 'facilitator':
          profile = await Facilitator.create({
            userId: user.id,
            ...profileData
          });
          break;
        case 'student':
          profile = await Student.create({
            userId: user.id,
            ...profileData
          });
          break;
      }

      // Generate token
      const token = generateToken(user);

      logger.info(`New user registered: ${user.email} (${role})`);

      res.status(201).json({
        user: user.toJSON(),
        token,
        profile
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        error: {
          message: req.t('errors.internal_server_error')
        }
      });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user with profile information
      const user = await User.findOne({
        where: { email },
        include: [
          {
            model: Manager,
            as: 'managerProfile'
          },
          {
            model: Facilitator,
            as: 'facilitatorProfile'
          },
          {
            model: Student,
            as: 'studentProfile'
          }
        ]
      });

      if (!user || !user.isActive) {
        return res.status(401).json({
          error: {
            message: req.t('auth.invalid_credentials')
          }
        });
      }

      // Validate password
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: {
            message: req.t('auth.invalid_credentials')
          }
        });
      }

      // Update last login
      await user.update({ lastLoginAt: new Date() });

      // Generate token
      const token = generateToken(user);

      logger.info(`User logged in: ${user.email}`);

      res.json({
        user: user.toJSON(),
        token
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        error: {
          message: req.t('errors.internal_server_error')
        }
      });
    }
  },

  // Get current user profile
  getProfile: async (req, res) => {
    try {
      // User is already attached by auth middleware
      res.json({
        user: req.user.toJSON()
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        error: {
          message: req.t('errors.internal_server_error')
        }
      });
    }
  }
};

module.exports = authController;
