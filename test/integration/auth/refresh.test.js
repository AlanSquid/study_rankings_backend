import { expect } from 'chai';
import request from 'supertest';
import db from '../../../models/index.js';
const { User } = db;
import app from '../../../app.js';
import generateJWT from '../../../lib/utils/generateJWT.js';
import bcrypt from 'bcryptjs';
import sinon from 'sinon';

describe('POST /auth/refresh', () => {
  let user;
  let refreshToken;
  beforeEach(async () => {
    // 密碼雜湊
    const hashedPassword = await bcrypt.hash('12345678', 10);

    user = await User.create({
      id: 1,
      name: 'test',
      email: 'test@test.com',
      phone: '0989889889',
      password: hashedPassword,
      isPhoneVerified: true,
      isEmailVerified: true
    });
  });

  afterEach(async () => {
    await user.destroy();
    sinon.restore();
  });

  it('正常情況: 更新access token成功，回傳200，且cookie要有refreshToken', async () => {
    refreshToken = generateJWT.getRefreshToken(user);
    sinon.stub(generateJWT, 'getAccessToken').resolves('fakeAccessToken');

    const response = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [`refreshToken=${refreshToken}`])
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).to.deep.equal({
      success: true,
      accessToken: 'fakeAccessToken'
    });
  });

  it('錯誤情況: refreshToken過期或無效，回傳401', async () => {
    const response = await request(app)
      .post('/api/v1/auth/refresh')
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).to.deep.equal({
      success: false,
      status: 401,
      message: 'Unauthorized: Please login or token expired'
    });
  });
});
