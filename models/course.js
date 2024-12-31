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
      Course.belongsTo(models.University, { foreignKey: 'universityId' });
      Course.belongsTo(models.CourseCategory, { foreignKey: 'courseCategoryId' });
      Course.belongsTo(models.DegreeLevel, { foreignKey: 'degreeLevelId' });
      Course.belongsTo(models.Currency, { foreignKey: 'CurrencyId' });
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
      location: DataTypes.STRING(50),
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
