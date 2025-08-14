module.exports = (sequelize, DataTypes) => {
  const Class = sequelize.define('Class', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    className: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true // e.g., '2024S', '2025J'
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    semester: {
      type: DataTypes.STRING,
      allowNull: false // e.g., 'S' for Spring, 'J' for January
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'classes',
    timestamps: true
  });

  Class.associate = function(models) {
    // Classes can have multiple course offerings
    Class.hasMany(models.CourseOffering, {
      foreignKey: 'classId',
      as: 'courseOfferings'
    });
  };

  return Class;
};