module.exports = (sequelize, DataTypes) => {
  const Mode = sequelize.define('Mode', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    modeName: {
      type: DataTypes.ENUM('Online', 'In-person', 'Hybrid'),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'modes',
    timestamps: true
  });

  Mode.associate = function(models) {
    // Modes can have multiple course offerings
    Mode.hasMany(models.CourseOffering, {
      foreignKey: 'modeId',
      as: 'courseOfferings'
    });
  };

  return Mode;
};