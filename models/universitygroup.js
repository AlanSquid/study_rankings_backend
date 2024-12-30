'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UniversityGroup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UniversityGroup.hasMany(models.University, {
        foreignKey: 'universityGroupId'
      });
    }
  }
  UniversityGroup.init(
    {
      name: DataTypes.STRING(50)
    },
    {
      sequelize,
      modelName: 'UniversityGroup',
      tableName: 'university_groups',
      timestamps: false
    }
  );
  return UniversityGroup;
};
