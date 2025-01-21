import { expect } from 'chai';
import request from 'supertest';
import db from '../../../models/index.js';
const { User, CourseFavorite } = db;
import app from '../../../app.js';
import generateJWT from '../../../lib/utils/generateJWT.js';

describe('POST /users/favorites/:courseId', () => {
  let user, favorites;
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
    if (favorites) await favorites.destroy();
    await user.destroy();
  });

  it('正常情況: 新增收藏課程，回傳200', async () => {
    const accessToken = await generateJWT.getAccessToken(user);

    const response = await request(app)
      .post(`/api/v1/users/favorites/1`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    favorites = await CourseFavorite.findOne({
      where: { userId: 1, courseId: 1 }
    });

    expect(favorites).to.not.be.null;
    expect(response.body).to.deep.equal({
      success: true,
      message: 'Course successfully added to favorite'
    });
  });

  it('錯誤情況: 重複新增收藏課程，回傳400', async () => {
    favorites = await CourseFavorite.create({
      userId: 1,
      courseId: 1
    });

    const accessToken = await generateJWT.getAccessToken(user);

    const response = await request(app)
      .post(`/api/v1/users/favorites/1`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect('Content-Type', /json/)
      .expect(409);

    expect(response.body).to.deep.equal({
      success: false,
      status: 409,
      message: 'Course already exists in favorite'
    });
  });

  it('錯誤情況: 新增不存在的收藏課程，回傳404', async () => {
    const accessToken = await generateJWT.getAccessToken(user);

    const response = await request(app)
      .post(`/api/v1/users/favorites/999`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect('Content-Type', /json/)
      .expect(404);

    expect(response.body).to.deep.equal({
      success: false,
      status: 404,
      message: 'Course not found'
    });
  });

  it('錯誤情況: 未登入，回傳401', async () => {
    const response = await request(app)
      .post(`/api/v1/users/favorites/1`)
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).to.deep.equal({
      success: false,
      status: 401,
      message: 'Unauthorized'
    });
  });
});
