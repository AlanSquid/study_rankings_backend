'use strict';

const { University, DegreeLevel, CourseCategory } = require('../../models');
const { faker } = require('@faker-js/faker');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const universities = await University.findAll();
    const degreeLevels = await DegreeLevel.findAll();
    const courseCategories = await CourseCategory.findAll();

    const courses = [];

    universities.forEach((university) => {
      for (let i = 0; i < 100; i++) {
        const degreeLevel = i < 50 ? degreeLevels[0] : degreeLevels[1];
        const randomCourseCategory =
          courseCategories[Math.floor(Math.random() * courseCategories.length)];
        const baseScore = Math.floor(Math.random() * 3) + 5;
        const ieltsScore = Math.random() < 0.5 ? baseScore : baseScore + 0.5;
        const minFee = Math.floor(Math.random() * 20000) + 30000;
        const maxFee = Math.floor(Math.random() * 10000) + 50000;

        courses.push({
          university_id: university.id,
          degree_level_id: degreeLevel.id,
          course_category_id: randomCourseCategory.id,
          name: faker.lorem.sentence({ min: 1, max: 4 }),
          currency_id: 1,
          min_fee: minFee,
          max_fee: Math.random() < 0.8 ? minFee : maxFee,
          eng_req: ieltsScore,
          eng_req_info: `IELTS ${ieltsScore}`,
          duration: Math.floor(Math.random() * 4) + 1,
          campus: faker.location.city(),
          course_url: 'http://example.com/course',
          eng_req_url: 'http://example.com/eng-req',
          acad_req_url: 'http://example.com/acad-req',
          fee_detail_url: 'http://example.com/fee-detail',
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    });

    await queryInterface.bulkInsert('courses', courses, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('courses', null, {});
  }
};
