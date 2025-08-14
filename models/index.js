const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../config/database.js')[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Load all model files that export a function
fs.readdirSync(__dirname)
  .filter(file => file.endsWith('.js') && file !== basename)
  .forEach(file => {
    const modelImport = require(path.join(__dirname, file));

    if (typeof modelImport === 'function') {
      const model = modelImport(sequelize, DataTypes);
      db[model.name] = model;
      console.log(`Loaded model: ${model.name}`);
    } else {
      console.warn(`Skipped file ${file}: does not export a function`);
    }
  });

// Run associate methods safely
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate && typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
