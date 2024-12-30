'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('universities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      ch_name: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      emblem_pic: {
        type: Sequelize.STRING,
        allowNull: true
      },
      university_group_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      state_territory_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'states_territories',
          key: 'id'
        }
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('universities');
  }
};
