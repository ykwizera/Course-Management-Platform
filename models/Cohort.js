module.exports = (sequelize, DataTypes) => {
  const Cohort = sequelize.define('Cohort', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cohortName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    program: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'cohorts',
    timestamps: true
  });

  Cohort.associate = function(models) {
    // Cohorts can have multiple students
    Cohort.hasMany(models.Student, {
      foreignKey: 'cohortId',
      as: 'students'
    });

    // Cohorts can have multiple course offerings
    Cohort.hasMany(models.CourseOffering, {
      foreignKey: 'cohortId',
      as: 'courseOfferings'
    });
  };

  return Cohort;
};