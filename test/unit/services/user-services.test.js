import { expect } from 'chai';
import sinon from 'sinon';
import db from '../../../models/index.js';
const { User, Verification, Course, CourseFavorite } = db;
import userServices from '../../../services/user-services.js';
import bcrypt from 'bcryptjs';
import loginAttemptManager from '../../../lib/login-attempt.js';
import addExtraProperty from '../../../lib/utils/addExtraProperty.js';

describe('user-services Unit Test', () => {
  describe('getUser', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('正常情境：應回傳使用者資料', async () => {
      // 模擬req
      const req = {
        user: {
          id: 1,
          name: 'test',
          email: 'test@gmail.com',
          phone: '0989889889',
          isPhoneVerified: 1,
          isEmailVerified: 1
        }
      };

      const data = await userServices.getUser(req);

      expect(data.success).to.be.true;
      expect(data.user).to.deep.equal(req.user);
    });

    it('異常情境：使用者不存在時應拋出404錯誤', async () => {
      // 模擬req，傳入不存在的使用者
      const req = { user: null };

      try {
        await userServices.getUser(req);
        expect.fail('預期應拋出 404 User not found 錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(404);
        expect(error.message).to.equal('User not found');
      }
    });
  });

  describe('updatePassword', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('正常情境：密碼更新成功', async () => {
      // 模擬req
      const req = {
        user: { id: 1 },
        body: {
          oldPassword: 'oldPassword',
          newPassword: 'newPassword'
        }
      };
      // 假user資料
      const mockUser = {
        id: 1,
        name: 'test',
        email: 'test@gmail.com',
        phone: '0989889889',
        password: 'hashedOldPassword',
        isPhoneVerified: 1,
        isEmailVerified: 1,
        save: sinon.stub().resolves()
      };

      sinon.stub(User, 'findOne').resolves(mockUser);
      sinon.stub(bcrypt, 'compare').resolves(true);
      sinon.stub(bcrypt, 'hash').resolves('hashedNewPassword');

      const data = await userServices.updatePassword(req);

      expect(data.success).to.be.true;
      expect(data.message).to.equal('Password updated');
      expect(
        User.findOne.calledWith({
          where: { id: req.user.id }
        })
      ).to.be.true;

      expect(bcrypt.compare.calledOnce).to.be.true;
      expect(bcrypt.compare.firstCall.args[0]).to.equal('oldPassword');
      expect(bcrypt.compare.firstCall.args[1]).to.equal('hashedOldPassword');
      expect(bcrypt.hash.calledWith(req.body.newPassword, 10)).to.be.true;
      expect(mockUser.save.called).to.be.true;
    });

    it('異常情境：使用者不存在時應拋出404錯誤', async () => {
      const req = {
        user: { id: 999 },
        body: {
          oldPassword: 'oldPassword',
          newPassword: 'newPassword'
        }
      };

      sinon.stub(User, 'findOne').resolves(null);

      try {
        await userServices.updatePassword(req);
        expect.fail('預期應拋出 404 User not found 錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(404);
        expect(error.message).to.equal('User not found');
      }
    });

    it('異常情境：舊密碼錯誤時應拋出400錯誤', async () => {
      const req = {
        user: { id: 1 },
        body: {
          oldPassword: 'wrongPassword',
          newPassword: 'newPassword'
        }
      };

      const mockUser = {
        id: 1,
        password: 'hashedOldPassword'
      };

      sinon.stub(User, 'findOne').resolves(mockUser);
      sinon.stub(bcrypt, 'compare').resolves(false);

      try {
        await userServices.updatePassword(req);
        expect.fail('預期應拋出 400 Old password is incorrect 錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(400);
        expect(error.message).to.equal('Old password is incorrect');
        expect(bcrypt.compare.calledWith(req.body.oldPassword, mockUser.password)).to.be.true;
      }
    });
  });

  describe('resetPassword', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('正常情境：密碼重置成功', async () => {
      const req = {
        ip: '127.0.0.1',
        body: {
          newPassword: 'newPassword123',
          code: 'valid-code'
        }
      };

      const mockVerification = {
        userId: 1,
        destroy: sinon.stub().resolves()
      };

      sinon.stub(bcrypt, 'hash').resolves('hashedNewPassword');
      sinon.stub(Verification, 'findOne').resolves(mockVerification);
      sinon.stub(User, 'update').resolves();
      sinon.stub(loginAttemptManager, 'reset').resolves();

      const result = await userServices.resetPassword(req);

      expect(result.success).to.be.true;
      expect(result.message).to.equal('Password updated');
      expect(bcrypt.hash.calledWith(req.body.newPassword, 10)).to.be.true;
      expect(
        User.update.calledWith(
          { password: 'hashedNewPassword' },
          { where: { id: mockVerification.userId } }
        )
      ).to.be.true;
      expect(loginAttemptManager.reset.calledWith(req.ip, mockVerification.phone)).to.be.true;
      expect(mockVerification.destroy.called).to.be.true;
    });

    it('異常情境：無效或過期的驗證碼應拋出400錯誤', async () => {
      const req = {
        ip: '127.0.0.1',
        body: {
          newPassword: 'newPassword123',
          code: 'invalid-code'
        }
      };

      sinon.stub(bcrypt, 'hash').resolves('hashedNewPassword');
      sinon.stub(Verification, 'findOne').resolves(null);
      sinon.stub(loginAttemptManager, 'reset').resolves();

      try {
        await userServices.resetPassword(req);
        expect.fail('預期應拋出 400 錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(400);
        expect(error.message).to.equal('Invalid or expired verification code');
        expect(loginAttemptManager.reset.called).to.be.false;
      }
    });
  });

  describe('updateEmail', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('正常情境：email更新成功', async () => {
      const req = {
        user: { id: 1 },
        body: { newEmail: 'new@example.com' }
      };

      const mockUser = {
        id: 1,
        email: 'old@example.com',
        save: sinon.stub().resolves()
      };

      sinon.stub(User, 'findOne').resolves(mockUser);

      const data = await userServices.updateEmail(req);

      expect(data.success).to.be.true;
      expect(data.message).to.equal('Email updated. Please verify your new email');
      expect(
        User.findOne.calledWith({
          where: { id: req.user.id }
        })
      ).to.be.true;
      expect(mockUser.isEmailVerified).to.be.false;
      expect(mockUser.save.called).to.be.true;
    });

    it('異常情境：使用者不存在時應拋出404錯誤', async () => {
      const req = {
        user: { id: 999 },
        body: { newEmail: 'new@example.com' }
      };

      sinon.stub(User, 'findOne').resolves(null);

      try {
        await userServices.updateEmail(req);
        expect.fail('預期應拋出404錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(404);
        expect(error.message).to.equal('User not found');
      }
    });

    it('異常情境：新舊email相同時應拋出400錯誤', async () => {
      const req = {
        user: { id: 1 },
        body: { newEmail: 'same@example.com' }
      };

      const mockUser = {
        id: 1,
        email: 'same@example.com'
      };

      sinon.stub(User, 'findOne').resolves(mockUser);

      try {
        await userServices.updateEmail(req);
        expect.fail('預期應拋出400錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(400);
        expect(error.message).to.equal('New email cannot be the same as current email');
      }
    });
  });

  describe('updateName', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('正常情境：name更新成功', async () => {
      const req = {
        user: { id: 1 },
        body: { newName: 'newName' }
      };

      const mockUser = {
        id: 1,
        name: 'oldName',
        save: sinon.stub().resolves()
      };

      sinon.stub(User, 'findOne').resolves(mockUser);

      const data = await userServices.updateName(req);

      expect(data.success).to.be.true;
      expect(data.message).to.equal('Name updated');
      expect(
        User.findOne.calledWith({
          where: { id: req.user.id }
        })
      ).to.be.true;
      expect(mockUser.name).to.equal('newName');
      expect(mockUser.save.called).to.be.true;
    });

    it('異常情境：使用者不存在時應拋出404錯誤', async () => {
      const req = {
        user: { id: 999 },
        body: { newName: 'newName' }
      };

      sinon.stub(User, 'findOne').resolves(null);

      try {
        await userServices.updateName(req);
        expect.fail('預期應拋出404錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(404);
        expect(error.message).to.equal('User not found');
      }
    });
  });

  describe('getFavorites', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('正常情境：應回傳使用者收藏的課程', async () => {
      const req = {
        user: { id: 1 },
        query: { page: 1 }
      };

      const mockFavorites = [
        {
          course: {
            id: 1,
            name: 'Course 1',
            minFee: 1000,
            maxFee: 2000,
            engReq: 'IELTS 6.5',
            engReqInfo: 'Minimum IELTS score of 6.5',
            duration: '1 year',
            campus: 'Campus 1',
            courseUrl: 'course1.com',
            university: {
              name: 'University 1',
              emblemPic: 'emblem1.png',
              universityRank: { rank: 1 }
            }
          }
        }
      ];

      const expectedCourses = [
        {
          id: 1,
          name: 'Course 1',
          minFee: 1000,
          maxFee: 2000,
          engReq: 'IELTS 6.5',
          engReqInfo: 'Minimum IELTS score of 6.5',
          duration: '1 year',
          campus: 'Campus 1',
          courseUrl: 'course1.com',
          university: {
            name: 'University 1',
            emblemPic: 'emblem1.png',
            rank: 1
          },
          isFavorited: true,
          isCompared: false
        }
      ];

      sinon.stub(CourseFavorite, 'count').resolves(1);
      sinon.stub(CourseFavorite, 'findAll').resolves(mockFavorites);
      sinon.stub(addExtraProperty, 'isFavorited').callsFake((courses, userId) => {
        courses.forEach((course) => {
          course.isFavorited = true;
        });
      });
      sinon.stub(addExtraProperty, 'isCompared').callsFake((courses, userId) => {
        courses.forEach((course) => {
          course.isCompared = false;
        });
      });

      const data = await userServices.getFavorites(req);

      expect(data.success).to.be.true;
      expect(data.courses).to.deep.equal(expectedCourses);
      expect(data.totalPages).to.equal(1);
      expect(addExtraProperty.isCompared.calledOnce).to.be.true;
      expect(addExtraProperty.isFavorited.calledOnce).to.be.true;
    });

    it('異常情境：使用者沒有收藏的課程', async () => {
      const req = {
        user: { id: 1 },
        query: { page: 1 }
      };

      sinon.stub(CourseFavorite, 'count').resolves(0);
      sinon.stub(CourseFavorite, 'findAll').resolves([]);
      sinon.stub(addExtraProperty, 'isFavorited').resolves({});
      sinon.stub(addExtraProperty, 'isCompared').resolves({});

      const data = await userServices.getFavorites(req);

      expect(data.success).to.be.true;
      expect(data.courses).to.deep.equal([]);
      expect(data.totalPages).to.equal(0);
      expect(addExtraProperty.isCompared.calledOnce).to.be.true;
      expect(addExtraProperty.isFavorited.calledOnce).to.be.true;
    });

    it('異常情境：頁數超過總頁數', async () => {
      const req = {
        user: { id: 1 },
        query: { page: 2 }
      };

      sinon.stub(CourseFavorite, 'count').resolves(1);
      sinon.stub(CourseFavorite, 'findAll').resolves([]);
      sinon.stub(addExtraProperty, 'isFavorited').resolves({});
      sinon.stub(addExtraProperty, 'isCompared').resolves({});

      const data = await userServices.getFavorites(req);

      expect(data.success).to.be.true;
      expect(data.courses).to.deep.equal([]);
      expect(data.totalPages).to.equal(1);
      expect(addExtraProperty.isCompared.calledOnce).to.be.true;
      expect(addExtraProperty.isFavorited.calledOnce).to.be.true;
    });
  });

  describe('addFavorite', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('正常情境：應成功新增收藏課程', async () => {
      const req = {
        user: { id: 1 },
        params: { courseId: 1 }
      };

      const mockCourse = {
        id: 1,
        name: 'Course 1'
      };

      sinon.stub(Course, 'findByPk').resolves(mockCourse);
      sinon.stub(CourseFavorite, 'findOne').resolves(null);
      sinon.stub(CourseFavorite, 'count').resolves(1);
      sinon.stub(CourseFavorite, 'create').resolves();

      const data = await userServices.addFavorite(req);

      expect(data.success).to.be.true;
      expect(data.message).to.equal('Course successfully added to favorite');
    });

    it('異常情境：課程不存在時應拋出404錯誤', async () => {
      const req = {
        user: { id: 1 },
        params: { courseId: 999 }
      };

      sinon.stub(Course, 'findByPk').resolves(null);

      try {
        await userServices.addFavorite(req);
        expect.fail('預期應拋出 404 Course not found 錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(404);
        expect(error.message).to.equal('Course not found');
      }
    });

    it('異常情境：課程已存在於收藏時應拋出409錯誤', async () => {
      const req = {
        user: { id: 1 },
        params: { courseId: 1 }
      };

      const mockFavorite = {
        userId: 1,
        courseId: 1
      };

      sinon.stub(Course, 'findByPk').resolves(mockFavorite);
      sinon.stub(CourseFavorite, 'findOne').resolves(mockFavorite);

      try {
        await userServices.addFavorite(req);
        expect.fail('預期應拋出 409 Course already exists in favorite 錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(409);
        expect(error.message).to.equal('Course already exists in favorite');
      }
    });

    it('異常情境：收藏數量超過上限時應拋出400錯誤', async () => {
      const req = {
        user: { id: 1 },
        params: { courseId: 1 }
      };

      const mockFavorite = {
        userId: 1,
        courseId: 1
      };

      sinon.stub(Course, 'findByPk').resolves(mockFavorite);
      sinon.stub(CourseFavorite, 'findOne').resolves(null);
      sinon.stub(CourseFavorite, 'count').resolves(101);

      try {
        await userServices.addFavorite(req);
        expect.fail('預期應拋出 400 Favorite limit exceeded 錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(400);
        expect(error.message).to.equal('Favorite limit exceeded');
      }
    });
  });

  describe('deleteFavorite', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('正常情境：應成功刪除收藏課程', async () => {
      const req = {
        user: { id: 1 },
        params: { courseId: 1 }
      };

      const mockFavorite = {
        userId: 1,
        courseId: 1,
        destroy: sinon.stub().resolves()
      };

      sinon.stub(CourseFavorite, 'findOne').resolves(mockFavorite);

      const data = await userServices.deleteFavorite(req);

      expect(data.success).to.be.true;
      expect(data.message).to.equal('Course successfully removed from favorite');
      expect(mockFavorite.destroy.called).to.be.true;
    });

    it('異常情境：課程不存在於收藏時應拋出404錯誤', async () => {
      const req = {
        user: { id: 1 },
        params: { courseId: 999 }
      };

      sinon.stub(CourseFavorite, 'findOne').resolves(null);

      try {
        await userServices.deleteFavorite(req);
        expect.fail('預期應拋出 404 Course not found in favorite 錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(404);
        expect(error.message).to.equal('Course not found in favorite');
      }
    });
  });
});
