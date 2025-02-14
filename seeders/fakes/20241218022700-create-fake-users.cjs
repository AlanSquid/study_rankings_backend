'use strict';
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = Array.from({ length: 10 }).map(() => ({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: `09${faker.number.int({ min: 10000000, max: 99999999 })}`,
      password: bcrypt.hashSync('12345678', 10),
      is_email_verified: true,
      is_phone_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    }));
    await queryInterface.bulkInsert('users', users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
