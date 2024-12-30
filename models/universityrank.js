'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UniversityRank extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UniversityRank.belongsTo(models.University, {
        foreignKey: 'universityId'
      });
    }
  }
  UniversityRank.init(
    {
      rank: DataTypes.STRING,
      universityId: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'UniversityRank',
      tableName: 'university_ranks',
      underscored: true
    }
  );
  return UniversityRank;
};
