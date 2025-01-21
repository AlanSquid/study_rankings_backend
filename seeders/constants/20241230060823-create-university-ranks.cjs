'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let universityRanks = [
      { rank: '39', university_id: 30 },
      { rank: '58', university_id: 31 },
      { rank: '61', university_id: 10 },
      { rank: '73', university_id: 1 },
      { rank: '77', university_id: 21 },
      { rank: '83', university_id: 7 },
      { rank: '128', university_id: 24 },
      { rank: '149', university_id: 42 },
      { rank: '154', university_id: 11 },
      { rank: '178', university_id: 5 },

      { rank: '201-250', university_id: 35 },
      { rank: '201-250', university_id: 20 },
      { rank: '201-250', university_id: 13 },

      { rank: '251-300', university_id: 39 },
      { rank: '251-300', university_id: 34 },
      { rank: '251-300', university_id: 32 },
      { rank: '251-300', university_id: 33 },
      { rank: '251-300', university_id: 8 },
      { rank: '251-300', university_id: 29 },

      { rank: '301-350', university_id: 26 },
      { rank: '301-350', university_id: 12 },

      { rank: '351-400', university_id: 40 },
      { rank: '351-400', university_id: 23 },

      { rank: '401-500', university_id: 3 },
      { rank: '401-500', university_id: 16 },
      { rank: '401-500', university_id: 15 },
      { rank: '401-500', university_id: 37 },
      { rank: '401-500', university_id: 19 },
      { rank: '401-500', university_id: 41 },
      { rank: '401-500', university_id: 2 },
      { rank: '401-500', university_id: 36 },

      { rank: '501-600', university_id: 17 },
      { rank: '501-600', university_id: 9 },

      { rank: '601-800', university_id: 22 },

      { rank: '801-1000', university_id: 4 },

      { rank: '1201-1500', university_id: 43 }
    ];
    universityRanks = universityRanks.map((universityRank) => {
      return {
        ...universityRank,
        created_at: new Date(),
        updated_at: new Date()
      };
    });
    await queryInterface.bulkInsert('university_ranks', universityRanks, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('university_ranks', null, {});
  }
};
