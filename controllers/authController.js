const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Manager, Facilitator } = require('../models');
const logger = require('../utils/logger');

const generateToken = (user, role) => {
  return jwt.sign(
    { id: user.id, email: user.email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Try to find user in managers first
    let user = await Manager.findOne({ where: { email, isActive: true } });
    let role = 'manager';

    // If not found in managers, try facilitators
    if (!user) {
      user = await Facilitator.findOne({ where: { email, isActive: true } });
      role = 'facilitator';
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user, role);

    logger.info(`User ${email} logged in successfully as ${role}`);

    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, ...additionalData } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    let user;
    if (role === 'manager') {
      user = await Manager.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        ...additionalData
      });
    } else if (role === 'facilitator') {
      user = await Facilitator.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        ...additionalData
      });
    } else {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    const token = generateToken(user, role);

    logger.info(`New ${role} registered: ${email}`);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  login,
  register
};