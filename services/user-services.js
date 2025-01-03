const { User, Verification } = require('../models');
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
  }
};

module.exports = userServices;
