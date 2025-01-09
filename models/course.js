'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Course.belongsTo(models.University, { foreignKey: 'universityId', as: 'university' });
      Course.belongsTo(models.CourseCategory, {
        foreignKey: 'courseCategoryId',
        as: 'courseCategory'
      });
      Course.belongsTo(models.DegreeLevel, { foreignKey: 'degreeLevelId', as: 'degreeLevel' });
      Course.belongsTo(models.Currency, { foreignKey: 'currencyId', as: 'currency' });
      Course.hasMany(models.CourseComparison, { foreignKey: 'courseId', as: 'courseComparison' });
      Course.belongsToMany(models.User, {
        through: models.CourseComparison,
        foreignKey: 'courseId',
        otherKey: 'userId',
        as: 'comparisonUsers'
      });
      Course.hasMany(models.CourseFavorite, { foreignKey: 'courseId', as: 'courseFavorite' });
      Course.belongsToMany(models.User, {
        through: models.CourseFavorite,
        foreignKey: 'courseId',
        otherKey: 'userId',
        as: 'user'
      });
    }
  }
  Course.init(
    {
      universityId: DataTypes.INTEGER,
      degreeLevelId: DataTypes.INTEGER,
      courseCategoryId: DataTypes.INTEGER,
      name: DataTypes.STRING(50),
      currencyId: DataTypes.INTEGER,
      minFee: DataTypes.INTEGER,
      maxFee: DataTypes.INTEGER,
      engReq: DataTypes.INTEGER,
      engReqInfo: DataTypes.STRING(50),
      duration: DataTypes.INTEGER,
      campus: DataTypes.STRING(50),
      courseUrl: DataTypes.STRING,
      engReqUrl: DataTypes.STRING,
      acadReqUrl: DataTypes.STRING,
      feeDetailUrl: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'Course',
      tableName: 'courses',
      underscored: true
    }
  );
  return Course;
};
