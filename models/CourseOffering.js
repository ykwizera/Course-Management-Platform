const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CourseOffering = sequelize.define('CourseOffering', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    moduleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Modules',
        key: 'id'
      }
    },
    facilitatorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Facilitators',
        key: 'id'
      }
    },
    cohortId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Cohorts',
        key: 'id'
      }
    },
    classId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Classes',
        key: 'id'
      }
    },
    modeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Modes',
        key: 'id'
      }
    },
    intakePeriod: {
      type: DataTypes.ENUM('HT1', 'HT2', 'FT'),
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    maxStudents: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    status: {
      type: DataTypes.ENUM('planned', 'active', 'completed', 'cancelled'),
      defaultValue: 'planned'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    indexes: [
      {
        fields: ['moduleId', 'cohortId', 'classId', 'intakePeriod']
      },
      {
        fields: ['facilitatorId']
      },
      {
        fields: ['status']
      }
    ]
  });

  CourseOffering.associate = (models) => {
    CourseOffering.belongsTo(models.Module, {
      foreignKey: 'moduleId',
      as: 'module'
    });
    
    CourseOffering.belongsTo(models.Facilitator, {
      foreignKey: 'facilitatorId',
      as: 'facilitator'
    });
    
    CourseOffering.belongsTo(models.Cohort, {
      foreignKey: 'cohortId',
      as: 'cohort'
    });
    
    CourseOffering.belongsTo(models.Class, {
      foreignKey: 'classId',
      as: 'class'
    });
    
    CourseOffering.belongsTo(models.Mode, {
      foreignKey: 'modeId',
      as: 'mode'
    });
    
    CourseOffering.hasMany(models.ActivityTracker, {
      foreignKey: 'allocationId',
      as: 'activityLogs'
    });
  };

  return CourseOffering;
};
