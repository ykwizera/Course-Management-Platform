const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ActivityTracker = sequelize.define('ActivityTracker', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    allocationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'CourseOfferings',
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
    weekNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 52
      }
    },
    weekStartDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    weekEndDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    attendance: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of boolean values for attendance marking'
    },
    formativeOneGrading: {
      type: DataTypes.ENUM('Not Started', 'Pending', 'Done'),
      defaultValue: 'Not Started'
    },
    formativeTwoGrading: {
      type: DataTypes.ENUM('Not Started', 'Pending', 'Done'),
      defaultValue: 'Not Started'
    },
    summativeGrading: {
      type: DataTypes.ENUM('Not Started', 'Pending', 'Done'),
      defaultValue: 'Not Started'
    },
    courseModeration: {
      type: DataTypes.ENUM('Not Started', 'Pending', 'Done'),
      defaultValue: 'Not Started'
    },
    intranetSync: {
      type: DataTypes.ENUM('Not Started', 'Pending', 'Done'),
      defaultValue: 'Not Started'
    },
    gradeBookStatus: {
      type: DataTypes.ENUM('Not Started', 'Pending', 'Done'),
      defaultValue: 'Not Started'
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['allocationId', 'weekNumber']
      },
      {
        fields: ['facilitatorId', 'weekNumber']
      },
      {
        fields: ['weekStartDate', 'weekEndDate']
      }
    ]
  });

  // Instance method to check if log is complete
  ActivityTracker.prototype.isComplete = function() {
    const requiredFields = [
      'formativeOneGrading',
      'formativeTwoGrading', 
      'summativeGrading',
      'courseModeration',
      'intranetSync',
      'gradeBookStatus'
    ];
    
    return requiredFields.every(field => this[field] === 'Done');
  };

  // Instance method to get completion percentage
  ActivityTracker.prototype.getCompletionPercentage = function() {
    const fields = [
      'formativeOneGrading',
      'formativeTwoGrading',
      'summativeGrading', 
      'courseModeration',
      'intranetSync',
      'gradeBookStatus'
    ];
    
    const completedCount = fields.filter(field => this[field] === 'Done').length;
    return Math.round((completedCount / fields.length) * 100);
  };

  ActivityTracker.associate = (models) => {
    ActivityTracker.belongsTo(models.CourseOffering, {
      foreignKey: 'allocationId',
      as: 'courseOffering'
    });
    
    ActivityTracker.belongsTo(models.Facilitator, {
      foreignKey: 'facilitatorId',
      as: 'facilitator'
    });
  };

  return ActivityTracker;
};
