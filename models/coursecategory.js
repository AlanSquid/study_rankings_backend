'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CourseCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CourseCategory.hasMany(models.UniversityCourse, { foreignKey: 'courseCategoryId' });
    }
  }
  CourseCategory.init(
    {
      name: DataTypes.STRING(50),
      chName: DataTypes.STRING(20)
    },
    {
      sequelize,
      modelName: 'CourseCategory',
      tableName: 'course_categories',
      timestamps: false
    }
  );
  return CourseCategory;
};
