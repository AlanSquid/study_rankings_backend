'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const courseCategories = [
      { name: 'Arts and Humanities', chName: '藝術與人文' },
      { name: 'Business and Management', chName: '商業與管理' },
      { name: 'Engineering and Technology', chName: '工程與技術' },
      { name: 'Health and Medicine', chName: '健康與醫學' },
      { name: 'Law and Legal Studies', chName: '法律與法律研究' },
      { name: 'Natural Sciences', chName: '自然科學' },
      { name: 'Social Sciences', chName: '社會科學' },
      { name: 'Education', chName: '教育' },
      { name: 'Information Technology', chName: '資訊技術' },
      { name: 'Creative Arts', chName: '創意藝術' },
      { name: 'Other', chName: '其他' }
    ];
    await queryInterface.bulkInsert('course_categories', courseCategories, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('course_categories', null, {});
  }
};
