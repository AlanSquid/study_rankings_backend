'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const universitiesJson = require('../universities.json');
    const universities = universitiesJson.map((university) => ({
      ...university,
      created_at: new Date(),
      updated_at: new Date()
    }));
    await queryInterface.bulkInsert('universities', universities, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('universities', null, {});
  }
};
