const jwt = require('jsonwebtoken');
const { User, Manager, Facilitator } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { 
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'course-management-system'
    }
  );
};

// Verify JWT token middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: {
          message: req.t('auth.token_required')
        }
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fetch user with profile information
    const user = await User.findByPk(decoded.id, {
      include: [
        {
          model: Manager,
          as: 'managerProfile'
        },
        {
          model: Facilitator,
          as: 'facilitatorProfile'
        }
      ]
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: {
          message: req.t('auth.invalid_token')
        }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: {
          message: req.t('auth.token_expired')
        }
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: {
          message: req.t('auth.invalid_token')
        }
      });
    }

    return res.status(500).json({
      error: {
        message: req.t('errors.internal_server_error')
      }
    });
  }
};

// Role-based authorization middleware
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: req.t('auth.authentication_required')
        }
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          message: req.t('auth.insufficient_permissions')
        }
      });
    }

    next();
  };
};

// Manager-only access
const requireManager = requireRole('manager');

// Facilitator-only access
const requireFacilitator = requireRole('facilitator');

// Manager or Facilitator access
const requireStaff = requireRole('manager', 'facilitator');

module.exports = {
  generateToken,
  authenticateToken,
  requireRole,
  requireManager,
  requireFacilitator,
  requireStaff
};
