'use strict';
const {Model} = require('sequelize');

module.exports = (sequelize, DataTypes) => {

  class User extends Model {

    static associate(models) {
      // define association here
      models.User.hasMany(models.Message);
    }
  };

  User.init({
    user_email: DataTypes.STRING,
    user_name: DataTypes.STRING,
    user_password: DataTypes.STRING,
    user_bio: DataTypes.STRING,
    user_isAdmin: DataTypes.BOOLEAN
  },

  {
    sequelize,
    modelName: 'User',
  });

  return User;

};