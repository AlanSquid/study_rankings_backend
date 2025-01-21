import { expect } from 'chai';
import request from 'supertest';
import db from '../../../models/index.js';
const { User } = db;
import app from '../../../app.js';
import generateJWT from '../../../lib/utils/generateJWT.js';
import bcrypt from 'bcryptjs';

describe('PATCH /users/profile/password', () => {
  let user;
  beforeEach(async () => {
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
    // 清理資料庫中的資料
    await user.destroy();
  });

  it('正常情況: 修改密碼，回傳200', async () => {
    const accessToken = await generateJWT.getAccessToken(user);

    const response = await request(app)
      .patch(`/api/v1/users/profile/password`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        oldPassword: '12345678',
        newPassword: '123456789',
        confirmPassword: '123456789'
      })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).to.deep.equal({
      success: true,
      message: 'Password updated'
    });
  });

  it('錯誤情況: 未登入，回傳401', async () => {
    const response = await request(app)
      .patch(`/api/v1/users/profile/password`)
      .send({
        oldPassword: '12345678',
        newPassword: '123456789',
        confirmPassword: '123456789'
      })
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).to.deep.equal({
      success: false,
      status: 401,
      message: 'Unauthorized'
    });
  });

  it('錯誤情況: 舊密碼錯誤，回傳400', async () => {
    const accessToken = await generateJWT.getAccessToken(user);

    const response = await request(app)
      .patch(`/api/v1/users/profile/password`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        oldPassword: '11111111',
        newPassword: '123456789',
        confirmPassword: '123456789'
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).to.deep.equal({
      success: false,
      status: 400,
      message: 'Old password is incorrect'
    });
  });

  it('錯誤情況: 新密碼不符合規則，回傳400', async () => {
    const accessToken = await generateJWT.getAccessToken(user);

    const response = await request(app)
      .patch(`/api/v1/users/profile/password`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        oldPassword: '12345678',
        newPassword: '1234567',
        confirmPassword: '1234567'
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).to.deep.equal({
      success: false,
      status: 400,
      message: 'Validation error',
      errors: {
        newPassword: 'Password must be at least 8 characters'
      }
    });
  });

  it('錯誤情況: 新密碼與確認密碼不符，回傳400', async () => {
    const accessToken = await generateJWT.getAccessToken(user);

    const response = await request(app)
      .patch(`/api/v1/users/profile/password`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        oldPassword: '12345678',
        newPassword: '123456789',
        confirmPassword: '123456788'
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).to.deep.equal({
      success: false,
      status: 400,
      message: 'Validation error',
      errors: {
        confirmPassword: 'Passwords do not match'
      }
    });
  });
});
