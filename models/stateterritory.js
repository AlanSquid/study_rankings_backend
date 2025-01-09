'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class StateTerritory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      StateTerritory.hasMany(models.University, {
        foreignKey: 'stateTerritoryId',
        as: 'university'
      });
    }
  }
  StateTerritory.init(
    {
      name: DataTypes.STRING(50),
      chName: DataTypes.STRING(20)
    },
    {
      sequelize,
      modelName: 'StateTerritory',
      tableName: 'states_territories',
      timestamps: false
    }
  );
  return StateTerritory;
};
