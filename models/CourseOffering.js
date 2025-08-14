module.exports = (sequelize, DataTypes) => {
  const CourseOffering = sequelize.define('CourseOffering', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    moduleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'modules',
        key: 'id'
      }
    },
    facilitatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'facilitators',
        key: 'id'
      }
    },
    cohortId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cohorts',
        key: 'id'
      }
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'classes',
        key: 'id'
      }
    },
    modeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'modes',
        key: 'id'
      }
    },
    trimester: {
      type: DataTypes.STRING,
      allowNull: false // e.g., 'T1', 'T2', 'T3'
    },
    intakePeriod: {
      type: DataTypes.ENUM('HT1', 'HT2', 'FT'),
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    maxStudents: {
      type: DataTypes.INTEGER,
      defaultValue: 30
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'managers',
        key: 'id'
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'course_offerings',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['moduleId', 'cohortId', 'classId', 'trimester', 'intakePeriod'] ,
        name: 'course_offerings_unique_idx' ,
      }
    ]
  });

  CourseOffering.associate = function(models) {
    // CourseOffering belongs to Module
    CourseOffering.belongsTo(models.Module, {
      foreignKey: 'moduleId',
      as: 'module'
    });

    // CourseOffering belongs to Facilitator
    CourseOffering.belongsTo(models.Facilitator, {
      foreignKey: 'facilitatorId',
      as: 'facilitator'
    });

    // CourseOffering belongs to Cohort
    CourseOffering.belongsTo(models.Cohort, {
      foreignKey: 'cohortId',
      as: 'cohort'
    });

    // CourseOffering belongs to Class
    CourseOffering.belongsTo(models.Class, {
      foreignKey: 'classId',
      as: 'class'
    });

    // CourseOffering belongs to Mode
    CourseOffering.belongsTo(models.Mode, {
      foreignKey: 'modeId',
      as: 'mode'
    });

    // CourseOffering belongs to Manager (creator)
    CourseOffering.belongsTo(models.Manager, {
      foreignKey: 'createdBy',
      as: 'creator'
    });

    // CourseOffering can have multiple activity trackers
    CourseOffering.hasMany(models.ActivityTracker, {
      foreignKey: 'allocationId',
      as: 'activityTrackers'
    });
  };

  return CourseOffering;
};