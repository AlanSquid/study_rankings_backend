const {
  User,
  Verification,
  Course,
  CourseFavorite,
  University,
  UniversityRank
} = require('../models');
const { Op } = require('sequelize');
const createError = require('http-errors');
const bcrypt = require('bcryptjs');
const loginAttemptManager = require('../lib/login-attempt');

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
    const coursesRaw = await Course.findAll({
      attributes: [
        'id',
        'name',
        'minFee',
        'maxFee',
        'engReq',
        'engReqInfo',
        'duration',
        'location'
      ],
      include: [
        {
          model: CourseFavorite,
          where: { userId },
          attributes: []
        },
        {
          model: University,
          attributes: ['name', 'emblemPic'],
          include: [
            {
              model: UniversityRank,
              attributes: ['rank']
            }
          ]
        }
      ],
      raw: true,
      nest: true
    });
    // 簡化巢狀結構，將 UniversityRank 的 rank 放到 University 的屬性中
    const courses = coursesRaw.map((course) => {
      if (course.University && course.University.UniversityRank) {
        const { UniversityRank, ...universityWithoutRank } = course.University;
        return {
          ...course,
          University: {
            ...universityWithoutRank,
            rank: UniversityRank.rank
          }
        };
      }
      return course;
    });

    return { success: true, courses };
  },
  addFavorite: async (req) => {
    const userId = req.user.id;
    const courseId = req.params.courseId;

    const course = await Course.findByPk(courseId);
    if (!course) throw createError(404, 'Course not found');

    const favorite = await CourseFavorite.findOne({
      where: { userId, courseId }
    });
    if (favorite) throw createError(409, 'Course already exists in favorite');

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

module.exports = userServices;
