import { expect } from 'chai';
import request from 'supertest';
import db from '../../../models/index.js';
const { User } = db;
import app from '../../../app.js';
import generateJWT from '../../../lib/utils/generateJWT.js';
import bcrypt from 'bcryptjs';
import sinon from 'sinon';

describe('POST /auth/login', () => {
  let user;
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

  it('正常情況: 登入成功，回傳200，且cookie要有refreshToken', async () => {
    sinon.stub(generateJWT, 'getAccessToken').resolves('fakeAccessToken');
    sinon.stub(generateJWT, 'getRefreshToken').returns('fakeRefreshToken');

    const payload = { phone: '0989889889', password: '12345678' };
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(200);

    const cookies = response.headers['set-cookie'];
    const refreshTokenCookie = cookies.find((cookie) => cookie.includes('refreshToken'));

    expect(refreshTokenCookie).to.include('fakeRefreshToken');
    expect(response.body).to.deep.equal({
      success: true,
      user: {
        id: 1,
        name: 'test',
        phone: '0989889889',
        email: 'test@test.com',
        isPhoneVerified: true,
        isEmailVerified: true
      },
      accessToken: 'fakeAccessToken'
    });
  });

  it('錯誤情況: 手機號碼不存在，回傳401', async () => {
    const payload = { phone: '0989888999', password: '12345678' };
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).to.deep.equal({
      success: false,
      status: 401,
      message: 'Login failed. 4 attempts remaining'
    });
  });

  it('錯誤情況: 密碼錯誤，回傳401', async () => {
    const payload = { phone: '0989889889', password: '123456789' };
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).to.deep.equal({
      success: false,
      status: 401,
      message: 'Login failed. 4 attempts remaining'
    });
  });

  it('錯誤情況: 嘗試登入第5次，回傳401，並鎖住2分鐘', async () => {
    const payload = { phone: '0989111222', password: '12345678' };
    for (let i = 0; i < 4; i++) {
      await request(app).post('/api/v1/auth/login').send(payload);
    }

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).to.deep.equal({
      success: false,
      status: 401,
      message: 'Login failed. Account locked for 2 minutes'
    });
  });
});
