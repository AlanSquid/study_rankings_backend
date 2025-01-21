import { expect } from 'chai';
import request from 'supertest';
import app from '../../../app.js';

describe('GET /universities/ranks', () => {
  it('正常情況: 取得所有大學排名資料，回傳200', async () => {
    const response = await request(app)
      .get(`/api/v1/universities/ranks`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.success).to.be.true;
    expect(response.body.ranks).to.deep.equal([
      {
        id: 1,
        rank: '39',
        university: {
          id: 30,
          name: 'University of Melbourne',
          chName: '墨爾本大學',
          emblemPic: '/images/universities/emblems/unimelb.webp'
        }
      },
      {
        id: 2,
        rank: '58',
        university: {
          id: 31,
          name: 'Monash University',
          chName: '蒙納許大學',
          emblemPic: '/images/universities/emblems/monash.webp'
        }
      },
      {
        id: 3,
        rank: '61',
        university: {
          id: 10,
          name: 'University of Sydney',
          chName: '雪梨大學',
          emblemPic: '/images/universities/emblems/sydney.webp'
        }
      },
      {
        id: 4,
        rank: '73',
        university: {
          id: 1,
          name: 'The Australian National University',
          chName: '澳洲國立大學',
          emblemPic: '/images/universities/emblems/anu.webp'
        }
      },
      {
        id: 5,
        rank: '77',
        university: {
          id: 21,
          name: 'University of Queensland',
          chName: '昆士蘭大學',
          emblemPic: '/images/universities/emblems/uq.webp'
        }
      },
      {
        id: 6,
        rank: '83',
        university: {
          id: 7,
          name: 'University of New South Wales',
          chName: '新南威爾斯大學',
          emblemPic: '/images/universities/emblems/unsw.webp'
        }
      },
      {
        id: 7,
        rank: '128',
        university: {
          id: 24,
          name: 'University of Adelaide',
          chName: '阿德雷得大學',
          emblemPic: '/images/universities/emblems/adelaide.webp'
        }
      },
      {
        id: 8,
        rank: '149',
        university: {
          id: 42,
          name: 'University of Western Australia',
          chName: '西澳大學',
          emblemPic: '/images/universities/emblems/uwa.webp'
        }
      },
      {
        id: 9,
        rank: '154',
        university: {
          id: 11,
          name: 'University of Technology Sydney',
          chName: '雪梨科技大學',
          emblemPic: '/images/universities/emblems/uts.webp'
        }
      },
      {
        id: 10,
        rank: '178',
        university: {
          id: 5,
          name: 'Macquarie University',
          chName: '麥覺理大學',
          emblemPic: '/images/universities/emblems/mq.webp'
        }
      },
      {
        id: 11,
        rank: '201-250',
        university: {
          id: 35,
          name: 'Deakin University',
          chName: '迪肯大學',
          emblemPic: '/images/universities/emblems/deakin.webp'
        }
      },
      {
        id: 12,
        rank: '201-250',
        university: {
          id: 20,
          name: 'Queensland University of Technology',
          chName: '昆士蘭科技大學',
          emblemPic: '/images/universities/emblems/qut.webp'
        }
      },
      {
        id: 13,
        rank: '201-250',
        university: {
          id: 13,
          name: 'University of Wollongong',
          chName: '臥龍崗大學',
          emblemPic: '/images/universities/emblems/uow.webp'
        }
      },
      {
        id: 14,
        rank: '251-300',
        university: {
          id: 39,
          name: 'Curtin University',
          chName: '科廷大學',
          emblemPic: '/images/universities/emblems/curtin.jpg'
        }
      },
      {
        id: 15,
        rank: '251-300',
        university: {
          id: 34,
          name: 'La Trobe University',
          chName: '樂卓博大學',
          emblemPic: '/images/universities/emblems/latrobe.webp'
        }
      },
      {
        id: 16,
        rank: '251-300',
        university: {
          id: 32,
          name: 'RMIT University',
          chName: '墨爾本皇家理工大學',
          emblemPic: '/images/universities/emblems/rmit.webp'
        }
      },
      {
        id: 17,
        rank: '251-300',
        university: {
          id: 33,
          name: 'Swinburne University of Technology',
          chName: '斯威本理工大學',
          emblemPic: '/images/universities/emblems/swinburne.webp'
        }
      },
      {
        id: 18,
        rank: '251-300',
        university: {
          id: 8,
          name: 'University of Newcastle',
          chName: '紐卡索大學',
          emblemPic: '/images/universities/emblems/newcastle.webp'
        }
      },
      {
        id: 19,
        rank: '251-300',
        university: {
          id: 29,
          name: 'University of Tasmania',
          chName: '塔斯馬尼亞大學',
          emblemPic: '/images/universities/emblems/utas.jpg'
        }
      },
      {
        id: 20,
        rank: '301-350',
        university: {
          id: 26,
          name: 'Flinders University',
          chName: '弗林德斯大學',
          emblemPic: '/images/universities/emblems/flinders.jpg'
        }
      },
      {
        id: 21,
        rank: '301-350',
        university: {
          id: 12,
          name: 'University of Western Sydney',
          chName: '西雪梨大學',
          emblemPic: '/images/universities/emblems/westernsydney.webp'
        }
      },
      {
        id: 22,
        rank: '351-400',
        university: {
          id: 40,
          name: 'Edith Cowan University',
          chName: '伊迪斯科文大學',
          emblemPic: '/images/universities/emblems/ecu.webp'
        }
      },
      {
        id: 23,
        rank: '351-400',
        university: {
          id: 23,
          name: 'University of Southern Queensland',
          chName: '南昆士蘭大學',
          emblemPic: '/images/universities/emblems/unisq.webp'
        }
      },
      {
        id: 24,
        rank: '401-500',
        university: {
          id: 3,
          name: 'Australian Catholic University',
          chName: '澳洲天主教大學',
          emblemPic: '/images/universities/emblems/acu.webp'
        }
      },
      {
        id: 25,
        rank: '401-500',
        university: {
          id: 16,
          name: 'Bond University',
          chName: '邦德大學',
          emblemPic: '/images/universities/emblems/bond.jpg'
        }
      },
      {
        id: 26,
        rank: '401-500',
        university: {
          id: 15,
          name: 'Charles Darwin University',
          chName: '查爾斯達爾文大學',
          emblemPic: '/images/universities/emblems/cdu.webp'
        }
      },
      {
        id: 27,
        rank: '401-500',
        university: {
          id: 37,
          name: 'Federation University Australia',
          chName: '澳洲聯邦大學',
          emblemPic: '/images/universities/emblems/federation.jpg'
        }
      },
      {
        id: 28,
        rank: '401-500',
        university: {
          id: 19,
          name: 'James Cook University',
          chName: '詹姆士庫克大學',
          emblemPic: '/images/universities/emblems/jcu.webp'
        }
      },
      {
        id: 29,
        rank: '401-500',
        university: {
          id: 41,
          name: 'Murdoch University',
          chName: '梅鐸大學',
          emblemPic: '/images/universities/emblems/murdoch.webp'
        }
      },
      {
        id: 30,
        rank: '401-500',
        university: {
          id: 2,
          name: 'University of Canberra',
          chName: '坎培拉大學',
          emblemPic: '/images/universities/emblems/canberra.webp'
        }
      },
      {
        id: 31,
        rank: '401-500',
        university: {
          id: 36,
          name: 'Victoria University',
          chName: '維多利亞大學',
          emblemPic: '/images/universities/emblems/vu.webp'
        }
      },
      {
        id: 32,
        rank: '501-600',
        university: {
          id: 17,
          name: 'Central Queensland University',
          chName: '中央昆士蘭大學',
          emblemPic: '/images/universities/emblems/cqu.webp'
        }
      },
      {
        id: 33,
        rank: '501-600',
        university: {
          id: 9,
          name: 'Southern Cross University',
          chName: '南十字星大學',
          emblemPic: '/images/universities/emblems/scu.jpg'
        }
      },
      {
        id: 34,
        rank: '601-800',
        university: {
          id: 22,
          name: 'University of the Sunshine Coast',
          chName: '陽光海岸大學',
          emblemPic: '/images/universities/emblems/usc.jpg'
        }
      },
      {
        id: 35,
        rank: '801-1000',
        university: {
          id: 4,
          name: 'Charles Sturt University',
          chName: '查爾斯史都華大學',
          emblemPic: '/images/universities/emblems/csu.jpg'
        }
      },
      {
        id: 36,
        rank: '1201-1500',
        university: {
          id: 43,
          name: 'University of Notre Dame Australia',
          chName: '澳洲聖母大學',
          emblemPic: '/images/universities/emblems/notredame.jpg'
        }
      }
    ]);
  });
});
