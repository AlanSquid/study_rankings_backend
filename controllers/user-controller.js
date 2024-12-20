const userServices = require('../services/user-services');

const userController = {
	getUsers: (req, res, next) => {
		userServices.getUsers(req, (err, data) => {
			err ? next(err) : res.json({ success: true, data });
		});
	},
	sendPhoneVerification: (req, res, next) => {
		userServices.sendPhoneVerification(req, (err, data) => {
			err ? next(err) : res.json({ success: true, data });
		});
	},
	sendEmailVerification: (req, res, next) => {
		userServices.sendEmailVerification(req, (err, data) => {
			err ? next(err) : res.json({ success: true, data });
		});
	},
	verifyEmail: (req, res, next) => {
		userServices.verifyEmail(req, (err, data) => {
			err ? next(err) : res.json({ success: true, data });
		});
	}
}

module.exports = userController;