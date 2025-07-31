const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Cohort = sequelize.define('Cohort', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
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
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['name']
      },
      {
        fields: ['isActive']
      }
    ]
  });

  Cohort.associate = (models) => {
    Cohort.hasMany(models.Student, {
      foreignKey: 'cohortId',
      as: 'students'
    });
    
    Cohort.hasMany(models.CourseOffering, {
      foreignKey: 'cohortId',
      as: 'courseOfferings'
    });
  };

  return Cohort;
};
