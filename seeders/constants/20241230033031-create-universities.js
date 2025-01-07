'use strict';

const e = require('express');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let universities = [
      {
        name: 'The Australian National University',
        ch_name: '澳洲國立大學',
        emblem_pic: '/images/universities/emblems/anu.webp',
        university_group_id: 1,
        state_territory_id: 1
      },
      {
        name: 'University of Canberra',
        ch_name: '坎培拉大學',
        emblem_pic: '/images/universities/emblems/canberra.webp',
        state_territory_id: 1
      },
      {
        name: 'Australian Catholic University',
        ch_name: '澳洲天主教大學',
        emblem_pic: '/images/universities/emblems/acu.webp',
        state_territory_id: 2
      },
      {
        name: 'Charles Sturt University',
        ch_name: '查爾斯史都華大學',
        emblem_pic: '/images/universities/emblems/csu.jpg',
        state_territory_id: 2
      },
      {
        name: 'Macquarie University',
        ch_name: '麥覺理大學',
        emblem_pic: '/images/universities/emblems/mq.webp',
        state_territory_id: 2
      },
      {
        name: 'University of New England',
        ch_name: '新英格蘭大學',
        emblem_pic: '/images/universities/emblems/une.jpg',
        state_territory_id: 2
      },
      {
        name: 'University of New South Wales',
        ch_name: '新南威爾斯大學',
        emblem_pic: '/images/universities/emblems/unsw.webp',
        university_group_id: 1,
        state_territory_id: 2
      },
      {
        name: 'University of Newcastle',
        ch_name: '紐卡索大學',
        emblem_pic: '/images/universities/emblems/newcastle.webp',
        university_group_id: 2,
        state_territory_id: 2
      },
      {
        name: 'Southern Cross University',
        ch_name: '南十字星大學',
        emblem_pic: '/images/universities/emblems/scu.jpg',
        state_territory_id: 2
      },
      {
        name: 'University of Sydney',
        ch_name: '雪梨大學',
        emblem_pic: '/images/universities/emblems/sydney.webp',
        university_group_id: 1,
        state_territory_id: 2
      },
      {
        name: 'University of Technology Sydney',
        ch_name: '雪梨科技大學',
        emblem_pic: '/images/universities/emblems/uts.webp',
        university_group_id: 2,
        state_territory_id: 2
      },
      {
        name: 'University of Western Sydney',
        ch_name: '西雪梨大學',
        emblem_pic: '/images/universities/emblems/westernsydney.webp',
        university_group_id: 3,
        state_territory_id: 2
      },
      {
        name: 'University of Wollongong',
        ch_name: '臥龍崗大學',
        emblem_pic: '/images/universities/emblems/uow.webp',
        state_territory_id: 2
      },
      {
        name: 'Avondale University',
        ch_name: '亞芳代爾大學',
        emblem_pic: '/images/universities/emblems/avondale.jpg',
        state_territory_id: 2
      },
      {
        name: 'Charles Darwin University',
        ch_name: '查爾斯達爾文大學',
        emblem_pic: '/images/universities/emblems/cdu.webp',
        state_territory_id: 3
      },
      {
        name: 'Bond University',
        ch_name: '邦德大學',
        emblem_pic: '/images/universities/emblems/bond.jpg',
        state_territory_id: 4
      },
      {
        name: 'Central Queensland University',
        ch_name: '中央昆士蘭大學',
        emblem_pic: '/images/universities/emblems/cqu.webp',
        state_territory_id: 4
      },
      {
        name: 'Griffith University',
        ch_name: '格里菲斯大學',
        emblem_pic: '/images/universities/emblems/griffith.webp',
        university_group_id: 3,
        state_territory_id: 4
      },
      {
        name: 'James Cook University',
        ch_name: '詹姆士庫克大學',
        emblem_pic: '/images/universities/emblems/jcu.webp',
        university_group_id: 3,
        state_territory_id: 4
      },
      {
        name: 'Queensland University of Technology',
        ch_name: '昆士蘭科技大學',
        emblem_pic: '/images/universities/emblems/qut.webp',
        state_territory_id: 4
      },
      {
        name: 'University of Queensland',
        ch_name: '昆士蘭大學',
        emblem_pic: '/images/universities/emblems/uq.webp',
        university_group_id: 1,
        state_territory_id: 4
      },
      {
        name: 'University of the Sunshine Coast',
        ch_name: '陽光海岸大學',
        emblem_pic: '/images/universities/emblems/usc.jpg',
        state_territory_id: 4
      },
      {
        name: 'University of Southern Queensland',
        ch_name: '南昆士蘭大學',
        emblem_pic: '/images/universities/emblems/unisq.webp',
        state_territory_id: 4
      },
      {
        name: 'University of Adelaide',
        ch_name: '阿德雷得大學',
        emblem_pic: '/images/universities/emblems/adelaide.webp',
        university_group_id: 1,
        state_territory_id: 5
      },
      {
        name: 'University of South Australia',
        ch_name: '南澳大學',
        emblem_pic: '/images/universities/emblems/unisa.webp',
        university_group_id: 2,
        state_territory_id: 5
      },
      {
        name: 'Flinders University',
        ch_name: '弗林德斯大學',
        emblem_pic: '/images/universities/emblems/flinders.webp',
        university_group_id: 3,
        state_territory_id: 5
      },
      {
        name: 'Torrens University Australia',
        ch_name: '澳洲托倫斯大學',
        emblem_pic: '/images/universities/emblems/torrens.webp',
        state_territory_id: 5
      },
      {
        name: 'Carnegie Mellon University',
        ch_name: '卡內基梅隆大學',
        emblem_pic: '/images/universities/emblems/cmu.webp',
        state_territory_id: 5
      },
      {
        name: 'University of Tasmania',
        ch_name: '塔斯馬尼亞大學',
        emblem_pic: '/images/universities/emblems/utas.jpg',
        state_territory_id: 6
      },
      {
        name: 'University of Melbourne',
        ch_name: '墨爾本大學',
        emblem_pic: '/images/universities/emblems/unimelb.webp',
        university_group_id: 1,
        state_territory_id: 7
      },
      {
        name: 'Monash University',
        ch_name: '蒙納許大學',
        emblem_pic: '/images/universities/emblems/monash.webp',
        university_group_id: 1,
        state_territory_id: 7
      },
      {
        name: 'RMIT University',
        ch_name: '墨爾本皇家理工大學',
        emblem_pic: '/images/universities/emblems/rmit.webp',
        university_group_id: 2,
        state_territory_id: 7
      },
      {
        name: 'Swinburne University of Technology',
        ch_name: '斯威本理工大學',
        emblem_pic: '/images/universities/emblems/swinburne.webp',
        state_territory_id: 7
      },
      {
        name: 'La Trobe University',
        ch_name: '樂卓博大學',
        emblem_pic: '/images/universities/emblems/latrobe.webp',
        university_group_id: 3,
        state_territory_id: 7
      },
      {
        name: 'Deakin University',
        ch_name: '迪肯大學',
        emblem_pic: '/images/universities/emblems/deakin.webp',
        university_group_id: 2,
        state_territory_id: 7
      },
      {
        name: 'Victoria University',
        ch_name: '維多利亞大學',
        emblem_pic: '/images/universities/emblems/vu.webp',
        state_territory_id: 7
      },
      {
        name: 'Federation University Australia',
        ch_name: '澳洲聯邦大學',
        emblem_pic: '/images/universities/emblems/federation.webp',
        state_territory_id: 7
      },
      {
        name: 'University of Divinity',
        ch_name: '神學大學',
        emblem_pic: '/images/universities/emblems/divinity.jpg',
        state_territory_id: 7
      },
      {
        name: 'Curtin University',
        ch_name: '科廷大學',
        emblem_pic: '/images/universities/emblems/curtin.webp',
        university_group_id: 2,
        state_territory_id: 8
      },
      {
        name: 'Edith Cowan University',
        ch_name: '伊迪斯科文大學',
        emblem_pic: '/images/universities/emblems/ecu.webp',
        state_territory_id: 8
      },
      {
        name: 'Murdoch University',
        ch_name: '梅鐸大學',
        emblem_pic: '/images/universities/emblems/murdoch.webp',
        university_group_id: 3,
        state_territory_id: 8
      },
      {
        name: 'University of Western Australia',
        ch_name: '西澳大學',
        emblem_pic: '/images/universities/emblems/uwa.webp',
        university_group_id: 1,
        state_territory_id: 8
      },
      {
        name: 'University of Notre Dame Australia',
        ch_name: '澳洲聖母大學',
        emblem_pic: '/images/universities/emblems/notredame.jpg',
        state_territory_id: 8
      }
    ];

    universities = universities.map((university) => ({
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
