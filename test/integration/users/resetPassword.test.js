import { expect } from 'chai';
import request from 'supertest';
import db from '../../../models/index.js';
const { User, Verification } = db;
import app from '../../../app.js';
import generateJWT from '../../../lib/utils/generateJWT.js';
import bcrypt from 'bcryptjs';
import emailService from '../../../lib/email.js';
import sinon from 'sinon';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Taipei');

describe('PATCH /users/profile/password/reset', () => {
  let user, verification;
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

    verification = await Verification.create({
      type: 'reset_pwd',
      target: 'test@test.com',
      code: '12345678',
      userId: 1,
      expiresAt: dayjs().add(30, 'minute').toDate()
    });
  });

  afterEach(async () => {
    // 清理資料庫中的資料
    await user.destroy();
    await verification.destroy();
    sinon.restore();
  });

  it('正常情況: 重設密碼，回傳200', async () => {
    const response = await request(app)
      .patch(`/api/v1/users/profile/password/reset`)
      .send({
        newPassword: '123456789',
        confirmNewPassword: '123456789',
        code: '12345678'
      })
      .expect('Content-Type', /json/)
      .expect(200);

    const updateVerification = await Verification.findOne({
      where: {
        userId: user.id,
        type: 'reset_pwd',
        target: user.email
      }
    });
    const updateUser = await User.findByPk(user.id);
    bcrypt.compare('123456789', updateUser.password, (err, result) => {
      expect(result).to.equal(true);
    });
    expect(updateVerification).to.equal(null);
    expect(response.body).to.deep.equal({
      success: true,
      message: 'Password updated'
    });
  });

  it('錯誤情況: 新密碼不符合規則，回傳400', async () => {
    const response = await request(app)
      .patch(`/api/v1/users/profile/password/reset`)
      .send({
        newPassword: '1234',
        confirmNewPassword: '1234',
        code: '12345678'
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

  it('錯誤情況: 確認密碼不符，回傳400', async () => {
    const response = await request(app)
      .patch(`/api/v1/users/profile/password/reset`)
      .send({
        newPassword: '123456789',
        confirmNewPassword: '123456',
        code: '12345678'
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).to.deep.equal({
      success: false,
      status: 400,
      message: 'Validation error',
      errors: {
        confirmNewPassword: 'Passwords do not match'
      }
    });
  });

  it('錯誤情況: 驗證碼錯誤，回傳400', async () => {
    const response = await request(app)
      .patch(`/api/v1/users/profile/password/reset`)
      .send({
        newPassword: '123456789',
        confirmNewPassword: '123456789',
        code: '12345679'
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).to.deep.equal({
      success: false,
      status: 400,
      message: 'Invalid or expired verification code'
    });
  });
});
