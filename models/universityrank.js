'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class UniversityRank extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UniversityRank.belongsTo(models.University, {
        foreignKey: 'universityId',
        as: 'university'
      });
    }
  }
  UniversityRank.init(
    {
      rank: DataTypes.STRING(20),
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
