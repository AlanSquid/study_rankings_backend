import { expect } from 'chai';
import request from 'supertest';
import app from '../../../app.js';

describe('GET /universities/courses/categories', () => {
  it('正常情況: 取得所有課程類別資料，回傳200', async () => {
    const response = await request(app)
      .get(`/api/v1/universities/courses/categories`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.success).to.be.true;
    expect(response.body.courseCategories).to.deep.equal([
      {
        id: 1,
        name: 'Arts and Humanities',
        chName: '藝術與人文'
      },
      {
        id: 2,
        name: 'Business and Management',
        chName: '商業與管理'
      },
      {
        id: 3,
        name: 'Engineering and Technology',
        chName: '工程與技術'
      },
      {
        id: 4,
        name: 'Health and Medicine',
        chName: '健康與醫學'
      },
      {
        id: 5,
        name: 'Law and Legal Studies',
        chName: '法律與法律研究'
      },
      {
        id: 6,
        name: 'Natural Sciences',
        chName: '自然科學'
      },
      {
        id: 7,
        name: 'Social Sciences',
        chName: '社會科學'
      },
      {
        id: 8,
        name: 'Education',
        chName: '教育'
      },
      {
        id: 9,
        name: 'Information Technology',
        chName: '資訊技術'
      },
      {
        id: 10,
        name: 'Creative Arts',
        chName: '創意藝術'
      },
      {
        id: 11,
        name: 'Other',
        chName: '其他'
      }
    ]);
  });
});
