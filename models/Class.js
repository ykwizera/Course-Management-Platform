const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Class = sequelize.define('Class', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 20]
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 2020,
        max: 2050
      }
    },
    trimester: {
      type: DataTypes.ENUM('1', '2', '3'),
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['code']
      },
      {
        fields: ['year', 'trimester']
      }
    ]
  });

  Class.associate = (models) => {
    Class.hasMany(models.CourseOffering, {
      foreignKey: 'classId',
      as: 'courseOfferings'
    });
  };

  return Class;
};
