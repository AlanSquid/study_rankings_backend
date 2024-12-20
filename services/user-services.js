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
			
			return cb(null, { success: true, user });

		} catch (err) {
			cb(err, null);
		}
	},
	sendPhoneVerification: async (req, cb) => {
		try {
			const phone = req.body.phone;
			let code = '';
			if (process.env.NODE_ENV === 'production') {
				code = await smsVerification.sendVerificationSMS(phone);
			} else {
				code = await smsVerification.testSendVerificationSMS(phone);
			}

			if (code) {
				return cb(null, { success: true, code });
			}
		} catch (err) {
			cb(err, null);
		}
	},
	sendEmailVerification: async (req, cb) => {
		try {
			const email = req.body.email;
			const verificationUrl = await emailVerification.sendVerificationEmail(email);
			return cb(null, { success: true, verificationUrl });
		} catch (err) {
			cb(err, null);
		}
	},
	verifyEmail: async (req, cb) => {
		try {
			const code = req.body.code;
			const result = await emailVerification.verifyEmail(code);
			if (result) {
				return cb(null, { success: true, message: 'Email verified' });
			}
		} catch (err) {
			cb(err, null);
		}
	}
}

module.exports = userServices;