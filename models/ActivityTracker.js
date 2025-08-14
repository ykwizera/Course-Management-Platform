module.exports = (sequelize, DataTypes) => {
  const ActivityTracker = sequelize.define('ActivityTracker', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    allocationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'course_offerings',
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
    attendance: {
      type: DataTypes.JSON, // Array of booleans for each student
      allowNull: true,
      defaultValue: []
    },
    formativeOneGrading: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      defaultValue: 'Not Started'
    },
    formativeTwoGrading: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      defaultValue: 'Not Started'
    },
    summativeGrading: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      defaultValue: 'Not Started'
    },
    courseModeration: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      defaultValue: 'Not Started'
    },
    intranetSync: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      defaultValue: 'Not Started'
    },
    gradeBookStatus: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
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
    tableName: 'activity_trackers',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['allocationId', 'weekNumber']
      }
    ]
  });

  ActivityTracker.associate = function(models) {
    // ActivityTracker belongs to CourseOffering
    ActivityTracker.belongsTo(models.CourseOffering, {
      foreignKey: 'allocationId',
      as: 'courseOffering'
    });
  };

  return ActivityTracker;
};