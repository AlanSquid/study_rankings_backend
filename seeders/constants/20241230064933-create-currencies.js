'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'currencies',
      [{ name: 'AUD' }, { name: 'TWD' }, { name: 'USD' }],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('currencies', null, {});
  }
};
