'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CourseFavorite extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CourseFavorite.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      CourseFavorite.belongsTo(models.Course, { foreignKey: 'courseId', as: 'course' });
    }
  }
  CourseFavorite.init(
    {
      userId: DataTypes.INTEGER,
      courseId: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'CourseFavorite',
      tableName: 'course_favorites',
      underscored: true
    }
  );
  return CourseFavorite;
};
