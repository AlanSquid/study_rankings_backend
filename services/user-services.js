const { User } = require('../models')
const { smsVerification, emailVerification } = require('../lib/verification');

const userServices = {
	getUser: async (req, cb) => {
		try {
			const userId = req.params.id;
			const user = await User.findOne({
				where: { id: userId },
				attributes: ['id', 'name', 'email', 'phone'],
				raw: true
			});
			if (!user) {
				return cb({ status: 400, message: 'User not found' }, null);
			}

			cb(null, { success: true, user });

		} catch (err) {
			cb(err, null);
		}
	},
	sendPhoneVerification: async (req, cb) => {
		try {
			const phone = req.body.phone;
			const code = await smsVerification.sendVerificationSMS(phone);

			return cb(null, { success: true, code });

		} catch (err) {
			cb({ status: 400, message: err.message }, null);
		}
	},
	sendEmailVerification: async (req, cb) => {
		try {
			const userId = req.user.id
			const email = req.body.email;
			const verificationUrl = await emailVerification.sendVerificationEmail(userId, email);

			return cb(null, { success: true, verificationUrl });

		} catch (err) {
			cb({ status: 400, message: err.message }, null);
		}
	},
	verifyEmail: async (req, cb) => {
		try {
			const code = req.body.code;
			await emailVerification.verifyEmail(code);
			cb(null, { success: true, message: 'Email verification successful' });
		} catch (err) {
			cb({ status: 400, message: err.message }, null);
		}
	}
}

module.exports = userServices;