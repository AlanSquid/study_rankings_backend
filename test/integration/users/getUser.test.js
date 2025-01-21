import { expect } from 'chai';
import request from 'supertest';
import db from '../../../models/index.js';
const { User } = db;
import app from '../../../app.js';
import generateJWT from '../../../lib/utils/generateJWT.js';

describe('GET /users/profile', () => {
  let user;
  beforeEach(async () => {
    user = await User.create({
      id: 1,
      name: 'test',
      email: 'test@test.com',
      phone: '0989889889',
      password: '12345678',
      isPhoneVerified: true,
      isEmailVerified: true
    });
  });

  afterEach(async () => {
    // 清理資料庫中的資料
    await user.destroy();
  });

  it('正常情況: 取得使用者資料，回傳200', async () => {
    const accessToken = await generateJWT.getAccessToken(user);

    const response = await request(app)
      .get(`/api/v1/users/profile`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).to.deep.equal({
      success: true,
      user: {
        id: 1,
        name: 'test',
        phone: '0989889889',
        email: 'test@test.com',
        isPhoneVerified: true,
        isEmailVerified: true
      }
    });
  });

  it('錯誤情況: 未登入，回傳401', async () => {
    const response = await request(app)
      .get(`/api/v1/users/profile`)
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).to.deep.equal({
      success: false,
      status: 401,
      message: 'Unauthorized'
    });
  });
});
