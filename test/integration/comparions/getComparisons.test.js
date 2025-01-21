import db from '../../../models/index.js';
import { expect } from 'chai';
import request from 'supertest';
import app from '../../../app.js';
import generateJWT from '../../../lib/utils/generateJWT.js';
const { User, Course, CourseComparison, University, UniversityRank } = db;

describe('GET /comparisons', () => {
  let user, comparisons;
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

    comparisons = await CourseComparison.create({
      userId: 1,
      courseId: 1
    });
  });

  afterEach(async () => {
    // 清理資料庫中的資料
    await comparisons.destroy();
    await user.destroy();
  });

  it('正常情況: 取得使用者比較課程，回傳200', async () => {
    const accessToken = await generateJWT.getAccessToken(user);

    const response = await request(app)
      .get(`/api/v1/comparisons`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect('Content-Type', /json/)
      .expect(200);
    const course = await Course.findOne({
      where: { id: 1 },
      include: {
        model: University,
        as: 'university',
        include: {
          model: UniversityRank,
          as: 'universityRank'
        }
      }
    });

    expect(response.body).to.deep.equal({
      courses: [
        {
          campus: course.campus,
          courseUrl: course.courseUrl,
          duration: course.duration,
          engReq: course.engReq,
          engReqInfo: course.engReqInfo,
          id: course.id,
          isFavorited: false,
          maxFee: course.maxFee,
          minFee: course.minFee,
          name: course.name,
          university: {
            emblemPic: course.university.emblemPic,
            name: course.university.name,
            rank: course.university.universityRank.rank
          }
        }
      ],
      success: true
    });
  });

  it('錯誤情況: 未登入，回傳401', async () => {
    const response = await request(app)
      .get(`/api/v1/comparisons`)
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).to.deep.equal({
      success: false,
      status: 401,
      message: 'Unauthorized'
    });
  });
});
