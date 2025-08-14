module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define('Student', {
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
    studentId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    cohortId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cohorts',
        key: 'id'
      }
    },
    enrollmentDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'students',
    timestamps: true
  });

  Student.associate = function(models) {
    // Students belong to a cohort
    Student.belongsTo(models.Cohort, {
      foreignKey: 'cohortId',
      as: 'cohort'
    });
  };

  return Student;
};