import { expect } from 'chai';
import request from 'supertest';
import db from '../../../models/index.js';
const { User, CourseFavorite, Course, University, UniversityRank } = db;
import app from '../../../app.js';
import generateJWT from '../../../lib/utils/generateJWT.js';

describe('DELETE /users/favorites/:courseId', () => {
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
    favorites = await CourseFavorite.create({
      userId: 1,
      courseId: 1
    });
  });

  afterEach(async () => {
    // 清理資料庫中的資料
    if (favorites) await favorites.destroy();
    await user.destroy();
  });

  it('正常情況: 刪除收藏課程，回傳200', async () => {
    const accessToken = await generateJWT.getAccessToken(user);

    const response = await request(app)
      .delete(`/api/v1/users/favorites/1`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    favorites = await CourseFavorite.findOne({
      where: { userId: 1, courseId: 1 }
    });

    expect(favorites).to.be.null;
    expect(response.body).to.deep.equal({
      success: true,
      message: 'Course successfully removed from favorite'
    });
  });

  it('錯誤情況: 刪除不存在的收藏課程，回傳404', async () => {
    const accessToken = await generateJWT.getAccessToken(user);

    const response = await request(app)
      .delete(`/api/v1/users/favorites/999`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect('Content-Type', /json/)
      .expect(404);

    expect(response.body).to.deep.equal({
      success: false,
      status: 404,
      message: 'Course not found in favorite'
    });
  });

  it('錯誤情況: 未登入，回傳401', async () => {
    const response = await request(app)
      .delete(`/api/v1/users/favorites/1`)
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).to.deep.equal({
      success: false,
      status: 401,
      message: 'Unauthorized'
    });
  });
});
