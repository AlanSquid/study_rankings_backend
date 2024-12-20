const { User, Verification } = require('../models')
const { smsVerification, emailVerification } = require('../lib/verification')

const userServices = {
	getUsers: async (req, cb) => {
		try {
			const users = await User.findAll({
				attributes: ['id', 'name', 'email', 'phone', 'isEmailVerified', 'isPhoneVerified']
			});
			const usersJSON = users.map(user => user.toJSON());
			return cb(null, usersJSON);

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
				return cb(null, { code });
			}
		} catch (err) {
			cb(err, null);
		}
	},
	sendEmailVerification: async (req, cb) => {
		try {
			const email = req.body.email;
			const verificationUrl = await emailVerification.sendVerificationEmail(email);
			return cb(null, { verificationUrl });
		} catch (err) {
			cb(err, null);
		}
	},
	verifyEmail: async (req, cb) => {
		try {
			const code = req.body.code;
			const result = await emailVerification.verifyEmail(code);
			if (result) {
				return cb(null, { message: 'Email verified' });
			}
		} catch (err) {
			cb(err, null);
		}
	}
}

module.exports = userServices;