import { expect } from 'chai';
import request from 'supertest';
import app from '../../../app.js';

describe('GET /universities', () => {
  it('正常情況: 取得所有大學資料，回傳200', async () => {
    const response = await request(app)
      .get(`/api/v1/universities`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.success).to.be.true;
    expect(response.body.universities.length).to.equal(43);
  });
});
