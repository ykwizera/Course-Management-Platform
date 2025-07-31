const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Facilitator = sequelize.define('Facilitator', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    employeeId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        len: [1, 50]
      }
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 100]
      }
    },
    specializations: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    hireDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  });

  Facilitator.associate = (models) => {
    Facilitator.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    
    Facilitator.hasMany(models.CourseOffering, {
      foreignKey: 'facilitatorId',
      as: 'courseOfferings'
    });
    
    Facilitator.hasMany(models.ActivityTracker, {
      foreignKey: 'facilitatorId',
      as: 'activityLogs'
    });
  };

  return Facilitator;
};
