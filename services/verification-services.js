const { smsVerification, emailVerification, resetPwdEmailVerification } = require('../lib/verification');
const {User} = require('../models')
const createError = require('http-errors')

const verificationServices = {
	sendPhoneVerification: async (req) => {
		const phone = req.body.phone;
		await smsVerification.sendVerificationSMS(phone);
		return { success: true, message: 'Verification SMS sent' };
	},
	sendEmailVerification: async (req) => {
		const userId = req.user.id
		const email = req.body.email;
		const user = await User.findByPk(userId)
		if (!user) throw createError(404, 'User not found')
		if (email !== user.email) throw createError(400, 'Email verification failed: The provided email does not match the registered email address')
		const verificationUrl = await emailVerification.sendVerificationEmail(userId, email);
		return { success: true, verificationUrl };
	},
	verifyEmail: async (req) => {
		const code = req.body.code;
		await emailVerification.verifyEmail(code);
		return { success: true, message: 'Email verification successful' };
	},
	sendResetPasswordEmail: async (req) => {
		const { phone, email } = req.body;
		await resetPwdEmailVerification.sendResetPasswordEmail(phone, email);
		return { success: true, message: 'Reset password email sent' };
	},
	verifyResetPassword: async (req) => {
		const { code } = req.body;
		await resetPwdEmailVerification.verifyResetPassword(code);
		return { success: true, message: 'Reset password verification successful' };
	},
}

module.exports = verificationServices;