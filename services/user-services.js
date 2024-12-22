const { User } = require('../models')
const { smsVerification, emailVerification } = require('../lib/verification');
const createError = require('http-errors')

const userServices = {
	getUser: async (req) => {
		const userId = req.params.id;
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
	sendPhoneVerification: async (req) => {
		const phone = req.body.phone;
		const code = await smsVerification.sendVerificationSMS(phone);
		return { success: true, code };
	},
	sendEmailVerification: async (req) => {
		const userId = req.user.id
		const email = req.body.email;
		const verificationUrl = await emailVerification.sendVerificationEmail(userId, email);
		return { success: true, verificationUrl };
	},
	verifyEmail: async (req) => {
		const code = req.body.code;
		await emailVerification.verifyEmail(code);
		return { success: true, message: 'Email verification successful' };
	}
}

module.exports = userServices;