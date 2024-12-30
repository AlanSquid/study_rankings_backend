'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('states_territories', [
      { name: 'Australian Capital Territory' },
      { name: 'New South Wales' },
      { name: 'Northern Territory' },
      { name: 'Queensland' },
      { name: 'South Australia' },
      { name: 'Tasmania' },
      { name: 'Victoria' },
      { name: 'Western Australia' }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('states_territories', null, {});
  }
};
