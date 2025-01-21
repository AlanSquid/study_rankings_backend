'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('states_territories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(50)
      },
      chName: {
        type: Sequelize.STRING(20)
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('states_territories');
  }
};
