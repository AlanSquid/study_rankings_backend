'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('university_courses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      university_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'universities',
          key: 'id'
        }
      },
      degree_level_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'degree_levels',
          key: 'id'
        }
      },
      course_category_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'course_categories',
          key: 'id'
        }
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      currency_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'currencies',
          key: 'id'
        },
        defaultValue: 1
      },
      min_fee: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      max_fee: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      eng_req: {
        allowNull: false,
        type: Sequelize.DECIMAL(2, 1)
      },
      eng_req_info: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      duration: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      location: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      course_url: {
        allowNull: false,
        type: Sequelize.STRING
      },
      eng_req_url: {
        allowNull: true,
        type: Sequelize.STRING
      },
      acad_req_url: {
        allowNull: true,
        type: Sequelize.STRING
      },
      fee_detail_url: {
        allowNull: true,
        type: Sequelize.STRING
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('university_courses');
  }
};
