'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Verification, {
        foreignKey: 'userId',
        onDelete: 'SET NULL'
      });
    }
  }
  User.init({
    name: DataTypes.STRING(50),
    email: DataTypes.STRING(50),
    phone: DataTypes.STRING(10),
    isEmailVerified: DataTypes.BOOLEAN,
    isPhoneVerified: DataTypes.BOOLEAN,
    password: DataTypes.STRING(50)
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
  });
  return User;
};