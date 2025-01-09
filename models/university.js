'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class University extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      University.belongsTo(models.UniversityGroup, {
        foreignKey: 'universityGroupId',
        as: 'universityGroup'
      });
      University.hasOne(models.UniversityRank, {
        foreignKey: 'universityId',
        as: 'universityRank'
      });
      University.hasMany(models.Course, { foreignKey: 'universityId', as: 'course' });
      University.belongsTo(models.StateTerritory, {
        foreignKey: 'stateTerritoryId',
        as: 'stateTerritory'
      });
    }
  }
  University.init(
    {
      name: DataTypes.STRING(50),
      chName: DataTypes.STRING(20),
      emblemPic: DataTypes.STRING,
      universityGroupId: DataTypes.INTEGER,
      stateTerritoryId: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'University',
      tableName: 'universities',
      underscored: true
    }
  );
  return University;
};
