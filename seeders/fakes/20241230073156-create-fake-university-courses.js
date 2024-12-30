'use strict';

const { University, DegreeLevel, CourseCategory } = require('../../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const universities = await University.findAll();
    const degreeLevels = await DegreeLevel.findAll();
    const courseCategories = await CourseCategory.findAll();

    const universityCourses = [];

    universities.forEach((university) => {
      for (let i = 0; i < 100; i++) {
        const degreeLevel = i < 50 ? degreeLevels[0] : degreeLevels[1];
        const randomCourseCategory =
          courseCategories[Math.floor(Math.random() * courseCategories.length)];

        universityCourses.push({
          university_id: university.id,
          degree_level_id: degreeLevel.id,
          course_category_id: randomCourseCategory.id,
          name: `Course ${i + 1}`,
          currency_id: 1,
          min_tuition_fees: Math.floor(Math.random() * 20000) + 30000,
          max_tuition_fees: Math.random() < 0.8 ? null : 50000,
          eng_req: 'IELTS 6.5',
          duration: `${Math.floor(Math.random() * 4) + 1} years`,
          location: 'Campus',
          course_url: 'http://example.com/course',
          eng_req_url: 'http://example.com/eng-req',
          acad_req_url: 'http://example.com/acad-req',
          fee_detail_url: 'http://example.com/fee-detail',
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    });

    await queryInterface.bulkInsert('university_courses', universityCourses, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('university_courses', null, {});
  }
};
