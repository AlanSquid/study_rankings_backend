import { expect } from 'chai';
import request from 'supertest';
import db from '../../../models/index.js';
const { User } = db;
import app from '../../../app.js';
import generateJWT from '../../../lib/utils/generateJWT.js';
import bcrypt from 'bcryptjs';

describe('POST /auth/logout', () => {
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
  });
  it('正常情況: 登出成功，回傳200', async () => {
    await request(app)
      .post('/api/v1/auth/login')
      .send({ phone: '0989889889', password: '12345678' });
    const response = await request(app)
      .post('/api/v1/auth/logout')
      .expect('Content-Type', /json/)
      .expect(200);
    const cookies = response.headers['set-cookie'];
    const refreshTokenCookie = cookies.find((cookie) => cookie.includes('refreshToken'));

    expect(refreshTokenCookie).to.include('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    expect(response.body).to.deep.equal({
      success: true,
      message: 'Logged out'
    });
  });
});
