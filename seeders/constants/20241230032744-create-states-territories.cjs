'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('states_territories', [
      { name: 'Australian Capital Territory', chName: '澳洲首都領地' },
      { name: 'New South Wales', chName: '新南威爾斯州' },
      { name: 'Northern Territory', chName: '北領地' },
      { name: 'Queensland', chName: '昆士蘭' },
      { name: 'South Australia', chName: '南澳州' },
      { name: 'Tasmania', chName: '塔斯馬尼亞州' },
      { name: 'Victoria', chName: '維多利亞州' },
      { name: 'Western Australia', chName: '西澳州' }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('states_territories', null, {});
  }
};
