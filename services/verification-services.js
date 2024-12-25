const { smsVerification, emailVerification } = require('../lib/verification');

const verificationServices = {
  sendPhoneVerification: async (req) => {
		const phone = req.body.phone;
		await smsVerification.sendVerificationSMS(phone);
		return { success: true,  message: 'Verification SMS sent' };
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

module.exports = verificationServices;