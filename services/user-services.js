import db from '../models/index.js';
const { User, Verification, Course, CourseFavorite, University, UniversityRank } = db;
import { Op } from 'sequelize';
import createError from 'http-errors';
import bcrypt from 'bcryptjs';
import loginAttemptManager from '../lib/login-attempt.js';
import addExtraProperty from '../lib/utils/addExtraProperty.js';

const userServices = {
  getUser: async (req) => {
    const user = req.user;
    if (!user) {
      throw createError(404, 'User not found');
    }

    return { success: true, user };
  },
  updatePassword: async (req) => {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findOne({
      where: { id: userId }
    });
    if (!user) {
      throw createError(404, 'User not found');
    }
    // 比對舊密碼
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw createError(400, 'Old password is incorrect');
    }
    // 密碼雜湊
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    return { success: true, message: 'Password updated' };
  },
  resetPassword: async (req) => {
    const { newPassword, code } = req.body;
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const verification = await Verification.findOne({
      where: { code, type: 'reset_pwd' },
      expiresAt: { [Op.gt]: new Date() }
    });
    if (!verification) {
      throw createError(400, 'Invalid or expired verification code');
    }
    await User.update(
      {
        password: hashedNewPassword
      },
      {
        where: { id: verification.userId }
      }
    );

    // 重置登入嘗試記錄
    loginAttemptManager.reset(req.ip, verification.phone);

    // 成功重置密碼後刪除驗證紀錄
    await verification.destroy();

    return { success: true, message: 'Password updated' };
  },
  updateEmail: async (req) => {
    const userId = req.user.id;
    const { newEmail } = req.body;

    const user = await User.findOne({
      where: { id: userId }
    });
    if (!user) {
      throw createError(404, 'User not found');
    }
    if (user.email === newEmail) {
      throw createError(400, 'New email cannot be the same as current email');
    }
    user.email = newEmail;
    user.isEmailVerified = false;
    await user.save();

    return { success: true, message: 'Email updated. Please verify your new email' };
  },
  updateName: async (req) => {
    const userId = req.user.id;
    const { newName } = req.body;

    const user = await User.findOne({
      where: { id: userId }
    });
    if (!user) {
      throw createError(404, 'User not found');
    }
    user.name = newName;
    await user.save();

    return { success: true, message: 'Name updated' };
  },
  getFavorites: async (req) => {
    const userId = req.user.id;
    const page = req.query.page || 1;
    const perPage = 20;

    // 計算符合條件的總資料數
    const totalCount = await CourseFavorite.count({
      where: { userId }
    });

    // 計算總頁數
    const totalPages = Math.ceil(totalCount / perPage);

    // 取得收藏課程
    const favoritesRaw = await CourseFavorite.findAll({
      where: { userId },
      attributes: [],
      include: [
        {
          model: Course,
          as: 'course',
          attributes: [
            'id',
            'name',
            'minFee',
            'maxFee',
            'engReq',
            'engReqInfo',
            'duration',
            'campus'
          ],
          include: [
            {
              model: University,
              as: 'university',
              attributes: ['name', 'emblemPic'],
              include: [
                {
                  model: UniversityRank,
                  as: 'universityRank',
                  attributes: ['rank']
                }
              ]
            }
          ]
        }
      ],
      order: [['id', 'DESC']],
      limit: perPage,
      offset: page ? (parseInt(page) - 1) * perPage : 0,
      raw: true,
      nest: true
    });

    // 簡化巢狀結構，將 UniversityRank 的 rank 放到 University 的屬性中
    function formatFavoriteCourse(favoritesRaw) {
      return favoritesRaw.map(({ course }) => {
        if (course.university?.universityRank) {
          const {
            universityRank: { rank },
            ...universityWithoutRank
          } = course.university;
          return {
            ...course,
            university: {
              ...universityWithoutRank,
              rank
            }
          };
        }
        return course;
      });
    }
    const courses = formatFavoriteCourse(favoritesRaw);

    // 標記是否加入收藏
    await addExtraProperty.isFavorited(courses, userId);
    // 標記是否加入比較
    await addExtraProperty.isCompared(courses, userId);

    return { success: true, courses, totalPages };
  },
  addFavorite: async (req) => {
    const userId = req.user.id;
    const courseId = req.params.courseId;

    // 檢查課程是否存在
    const course = await Course.findByPk(courseId);
    if (!course) throw createError(404, 'Course not found');

    // 檢查是否已經加入收藏
    const favorite = await CourseFavorite.findOne({
      where: { userId, courseId }
    });
    if (favorite) throw createError(409, 'Course already exists in favorite');

    // 檢查是否超過收藏上限
    const favoriteCount = await CourseFavorite.count({ where: { userId } });
    if (favoriteCount >= 100) throw createError(400, 'Favorite limit exceeded');

    // 加入收藏
    await CourseFavorite.create({
      userId,
      courseId
    });

    return {
      success: true,
      message: 'Course successfully added to favorite'
    };
  },
  deleteFavorite: async (req) => {
    const userId = req.user.id;
    const courseId = req.params.courseId;

    const favorite = await CourseFavorite.findOne({
      where: { userId, courseId }
    });
    if (!favorite) throw createError(404, 'Course not found in comparison');

    await favorite.destroy();

    return {
      success: true,
      message: 'Course successfully removed from favorite'
    };
  }
};

export default userServices;
