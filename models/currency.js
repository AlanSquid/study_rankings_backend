'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Currency extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Currency.hasMany(models.Course, { foreignKey: 'currencyId', as: 'course' });
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
