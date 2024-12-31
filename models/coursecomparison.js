'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CourseComparison extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CourseComparison.belongsTo(models.User, { foreignKey: 'userId' });
      CourseComparison.belongsTo(models.Course, { foreignKey: 'courseId' });
    }
  }
  CourseComparison.init(
    {
      userId: DataTypes.INTEGER,
      courseId: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'CourseComparison',
      tableName: 'course_comparisons',
      underscored: true
    }
  );
  return CourseComparison;
};
