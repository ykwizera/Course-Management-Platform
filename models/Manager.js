module.exports = (sequelize, DataTypes) => {
  const Manager = sequelize.define('Manager', {
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
    department: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'managers',
    timestamps: true
  });

  Manager.associate = function(models) {
    // Managers can create course offerings
    Manager.hasMany(models.CourseOffering, {
      foreignKey: 'createdBy',
      as: 'createdCourseOfferings'
    });
  };

  return Manager;
};