const { User } = require('../models')
const createError = require('http-errors')
const bcrypt = require('bcryptjs')

const userServices = {
	getUser: async (req) => {
		const userId = req.user.id;
		const user = await User.findOne({
			where: { id: userId },
			attributes: ['id', 'name', 'email', 'phone'],
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
	}
}

module.exports = userServices;