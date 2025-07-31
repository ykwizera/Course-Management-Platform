const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Student = sequelize.define('Student', {
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
    studentId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 50]
      }
    },
    cohortId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Cohorts',
        key: 'id'
      }
    },
    enrollmentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'graduated', 'withdrawn'),
      defaultValue: 'active'
    }
  });

  Student.associate = (models) => {
    Student.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    
    Student.belongsTo(models.Cohort, {
      foreignKey: 'cohortId',
      as: 'cohort'
    });
  };

  return Student;
};
