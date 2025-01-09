'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DegreeLevel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      DegreeLevel.hasMany(models.Course, { foreignKey: 'degreeLevelId', as: 'course' });
    }
  }
  DegreeLevel.init(
    {
      name: DataTypes.STRING(10)
    },
    {
      sequelize,
      modelName: 'DegreeLevel',
      tableName: 'degree_levels',
      timestamps: false
    }
  );
  return DegreeLevel;
};
