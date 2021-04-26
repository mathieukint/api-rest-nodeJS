'use strict';
const {Model} = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class Message extends Model {
    
    static associate(models) {
      // define association here
      models.Message.belongsTo(models.User, {
          foreignKey: {
              allowNull: false
          }
      })
    }
  }

  Message.init({
    // userId: DataTypes.INTEGER,
    message_title: DataTypes.STRING,
    message_content: DataTypes.STRING,
    message_attachment: DataTypes.STRING,
    message_likes: DataTypes.INTEGER
  },
  
  {
    sequelize,
    modelName: 'Message',
  });

  return Message;

};