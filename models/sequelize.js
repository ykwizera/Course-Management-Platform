const { Sequelize } = require('sequelize');

// Change these values to match your MySQL setup
const sequelize = new Sequelize('course_allocation_system', 'root', 'yvette', {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = sequelize;
