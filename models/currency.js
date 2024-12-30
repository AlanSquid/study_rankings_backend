'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Currency extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Currency.hasMany(models.UniversityCourse, { foreignKey: 'currencyId' });
    }
  }
  Currency.init(
    {
      name: DataTypes.STRING(10)
    },
    {
      sequelize,
      modelName: 'Currency',
      tableName: 'currencies',
      timestamps: false
    }
  );
  return Currency;
};
