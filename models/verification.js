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
      Verification.belongsTo(models.User, {
        foreignKey: 'userId',
        onDelete: 'SET NULL'
      });
    }
  }
  Verification.init({
    target: DataTypes.STRING(50),
    type: DataTypes.ENUM('phone', 'email', 'reset_pwd'),
    code: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    expiresAt: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Verification',
    tableName: 'verifications',
    underscored: true,
  });
  return Verification;
};