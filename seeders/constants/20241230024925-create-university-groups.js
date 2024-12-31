'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const universityGroups = [{ name: 'Group of 8' }, { name: 'ATN' }, { name: 'IRU' }];
    await queryInterface.bulkInsert('university_groups', universityGroups, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('university_groups', null, {});
  }
};
