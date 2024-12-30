'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const courseCategories = [
      { name: 'Arts and Humanities' },
      { name: 'Business and Management' },
      { name: 'Engineering and Technology' },
      { name: 'Health and Medicine' },
      { name: 'Law and Legal Studies' },
      { name: 'Natural Sciences' },
      { name: 'Social Sciences' },
      { name: 'Education' },
      { name: 'Information Technology' },
      { name: 'Creative Arts' },
      { name: 'Other' }
    ];
    await queryInterface.bulkInsert('course_categories', courseCategories, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('course_categories', null, {});
  }
};
