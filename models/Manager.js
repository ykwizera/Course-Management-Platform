const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Manager = sequelize.define('Manager', {
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
    department: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 100]
      }
    },
    permissions: {
      type: DataTypes.JSON,
      defaultValue: {
        canManageCourseAllocations: true,
        canViewAllActivityLogs: true,
        canManageFacilitators: true,
        canGenerateReports: true
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  Manager.associate = (models) => {
    Manager.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Manager;
};
