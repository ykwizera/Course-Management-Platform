module.exports = (sequelize, DataTypes) => {
  const Module = sequelize.define('Module', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    moduleCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    moduleName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    credits: {
      type: DataTypes.INTEGER,
      defaultValue: 3
    },
    duration: {
      type: DataTypes.INTEGER, // in weeks
      defaultValue: 12
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'modules',
    timestamps: true
  });

  Module.associate = function(models) {
    // Modules can have multiple course offerings
    Module.hasMany(models.CourseOffering, {
      foreignKey: 'moduleId',
      as: 'courseOfferings'
    });
  };

  return Module;
};