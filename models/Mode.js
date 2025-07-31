const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Mode = sequelize.define('Mode', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.ENUM('online', 'in-person', 'hybrid'),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  Mode.associate = (models) => {
    Mode.hasMany(models.CourseOffering, {
      foreignKey: 'modeId',
      as: 'courseOfferings'
    });
  };

  return Mode;
};
