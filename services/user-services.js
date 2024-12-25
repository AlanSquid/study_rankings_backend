const { User, Verification } = require('../models')
const { Op } = require('sequelize')	
const createError = require('http-errors')
const bcrypt = require('bcryptjs');
const { resetPwdEmailVerification } = require('../lib/verification');

const userServices = {
	getUser: async (req) => {
		const userId = req.user.id;
		const user = await User.findOne({
			where: { id: userId },
			attributes: ['id', 'name', 'email', 'phone', 'isPhoneVerified', 'isEmailVerified'],
			raw: true
		});
		if (!user) {
			throw createError(404, 'User not found')
		}

		return { success: true, user };
	},
	updatePassword: async (req) => {
		const userId = req.user.id;
		const { oldPassword, newPassword } = req.body;

		const user = await User.findOne({
			where: { id: userId, }
		});
		if (!user) {
			throw createError(404, 'User not found')
		}
		// 比對舊密碼
		const isMatch = await bcrypt.compare(oldPassword, user.password);
		if (!isMatch) {
			throw createError(400, 'Old password is incorrect');
		}
		// 密碼雜湊
		const hashedNewPassword = await bcrypt.hash(newPassword, 10)
		user.password = hashedNewPassword;
		await user.save();

		return { success: true, message: 'Password updated' };
	},
	sendResetPasswordEmail: async (req) => {
		const { phone, email } = req.body;

		// 寄送重置密碼email
		await resetPwdEmailVerification.sendResetPasswordEmail(phone, email);
		return { success: true, message: 'Reset password email sent' };
	},
	verifyResetPassword: async (req) => {
		const { code } = req.body;
		await resetPwdEmailVerification.verifyResetPassword(code);
		return { success: true, message: 'verification successful' };
	},
	resetPassword: async (req) => {
		const { newPassword, code } = req.body
		const hashedNewPassword = await bcrypt.hash(newPassword, 10)
		const verification = await Verification.findOne({where: {code, type: 'reset_pwd'}, expiresAt: { [Op.gt]: new Date() }})
		if (!verification) {
			throw createError(400, 'Invalid or expired verification code');
		}
		await User.update({
			password: hashedNewPassword
		}, {
			where: { id: verification.userId }
		})
		await verification.destroy()
		return { success: true, message: 'Password updated' };
	}
}

module.exports = userServices;