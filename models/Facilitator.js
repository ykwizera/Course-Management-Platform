module.exports = (sequelize, DataTypes) => {
  const Facilitator = sequelize.define('Facilitator', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    employeeId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    specialization: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'facilitators',
    timestamps: true
  });

  Facilitator.associate = function(models) {
    // Facilitators can be assigned to multiple course offerings
    Facilitator.hasMany(models.CourseOffering, {
      foreignKey: 'facilitatorId',
      as: 'courseOfferings'
    });

    // Facilitators can have multiple activity trackers
    Facilitator.belongsToMany(models.ActivityTracker, {
      through: models.CourseOffering,
      foreignKey: 'facilitatorId',
      as: 'activityTrackers'
    });
  };

  return Facilitator;
};