'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UniversityCourse extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UniversityCourse.belongsTo(models.University, { foreignKey: 'universityId' });
      UniversityCourse.belongsTo(models.CourseCategory, { foreignKey: 'courseCategoryId' });
      UniversityCourse.belongsTo(models.DegreeLevel, { foreignKey: 'degreeLevelId' });
      UniversityCourse.belongsTo(models.Currency, { foreignKey: 'CurrencyId' });
    }
  }
  UniversityCourse.init(
    {
      universityId: DataTypes.INTEGER,
      degreeLevelId: DataTypes.INTEGER,
      courseCategoryId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      currencyId: DataTypes.INTEGER,
      minTuitionFees: DataTypes.INTEGER,
      maxTuitionFees: DataTypes.INTEGER,
      engReq: DataTypes.STRING,
      duration: DataTypes.STRING,
      location: DataTypes.STRING,
      courseUrl: DataTypes.STRING,
      engReqUrl: DataTypes.STRING,
      acadReqUrl: DataTypes.STRING,
      feeDetailUrl: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'UniversityCourse',
      tableName: 'university_courses',
      underscored: true
    }
  );
  return UniversityCourse;
};
