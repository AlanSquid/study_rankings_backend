'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Verification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Verification.init({
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    target: DataTypes.STRING,
    type: DataTypes.ENUM('phone', 'email'),
    code: DataTypes.STRING,
    expiresAt: DataTypes.DATE,
    isUsed: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Verification',
    tableName: 'verifications',
    underscored: true,
  });
  return Verification;
};