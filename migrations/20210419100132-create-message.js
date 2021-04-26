'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Messages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'Users',
            key: 'id'
        }
      },
      message_title: {
        allowNull: false,
        type: Sequelize.STRING
      },
      message_content: {
        allowNull: false,
        type: Sequelize.STRING
      },
      message_attachment: {
        allowNull: false,
        type: Sequelize.STRING
      },
      message_likes: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Messages');
  }
};