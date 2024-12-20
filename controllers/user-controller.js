const userServices = require('../services/user-services');

const userController = {
	getUser: (req, res, next) => {
		userServices.getUser(req, (err, data) => {
			err ? next(err) : res.json({ data });
		});
	},
	sendPhoneVerification: (req, res, next) => {
		userServices.sendPhoneVerification(req, (err, data) => {
			err ? next(err) : res.json({ data });
		});
	},
	sendEmailVerification: (req, res, next) => {
		userServices.sendEmailVerification(req, (err, data) => {
			err ? next(err) : res.json({ data });
		});
	},
	verifyEmail: (req, res, next) => {
		userServices.verifyEmail(req, (err, data) => {
			err ? next(err) : res.json({ data });
		});
	}
}

module.exports = userController;