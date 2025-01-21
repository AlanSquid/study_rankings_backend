import { expect } from 'chai';
import request from 'supertest';
import db from '../../../models/index.js';
const { User } = db;
import app from '../../../app.js';
import generateJWT from '../../../lib/utils/generateJWT.js';
import bcrypt from 'bcryptjs';
import sinon from 'sinon';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Taipei');

describe('PATCH /users/profile/name', () => {
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
    sinon.restore();
  });

  it('正常情況: 修改姓名，回傳200', async () => {
    const accessToken = await generateJWT.getAccessToken(user);

    const response = await request(app)
      .patch(`/api/v1/users/profile/name`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        newName: 'newName'
      })
      .expect('Content-Type', /json/)
      .expect(200);

    const updatedUser = await User.findByPk(1);
    expect(updatedUser.name).to.equal('newName');
    expect(response.body).to.deep.equal({
      success: true,
      message: 'Name updated'
    });
  });

  it('錯誤情況: 未登入，回傳401', async () => {
    const response = await request(app)
      .patch(`/api/v1/users/profile/email`)
      .send({
        newName: 'newName'
      })
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).to.deep.equal({
      success: false,
      status: 401,
      message: 'Unauthorized'
    });
  });

  it('錯誤情況: 姓名為空值，回傳400', async () => {
    const accessToken = await generateJWT.getAccessToken(user);

    const response = await request(app)
      .patch(`/api/v1/users/profile/name`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        newName: ''
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).to.deep.equal({
      success: false,
      status: 400,
      message: 'Validation error',
      errors: {
        newName: 'Name is required'
      }
    });
  });
});
