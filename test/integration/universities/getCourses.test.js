import { expect } from 'chai';
import request from 'supertest';
import db from '../../../models/index.js';
const { User } = db;
import app from '../../../app.js';
import generateJWT from '../../../lib/utils/generateJWT.js';

describe('GET /universities/courses', () => {
  let user;
  afterEach(async () => {
    if (user) await user.destroy();
  });
  it('正常情況: 未登入，取得10筆課程資料，回傳200', async () => {
    const response = await request(app)
      .get(`/api/v1/universities/courses`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.success).to.be.true;
    expect(response.body.courses.length).to.equal(10);
  });

  it('正常情況: 登入，取得10筆課程資料，回傳200', async () => {
    user = await User.create({
      name: 'test',
      email: 'test@test.com',
      phone: '0989889889',
      password: '12345678',
      isPhoneVerified: true,
      isEmailVerified: true
    });

    const accessToken = await generateJWT.getAccessToken(user);

    const response = await request(app)
      .get(`/api/v1/universities/courses`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.success).to.be.true;
    expect(response.body.courses.length).to.equal(10);
    response.body.courses.forEach((course) => {
      expect(course).to.have.property('isCompared');
      expect(course).to.have.property('isFavorited');
    });
  });
});
