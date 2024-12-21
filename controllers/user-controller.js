const userServices = require('../services/user-services');
const { formatResponse } = require('../lib/utils/format-response');

const userController = {
	getUser: (req, res, next) => {
		userServices.getUser(req, (err, data) => {
			err ? next(err) : res.json(formatResponse(data));
		});
	},
	sendPhoneVerification: (req, res, next) => {
		userServices.sendPhoneVerification(req, (err, data) => {
			err ? next(err) : res.json(formatResponse(data));
		});
	},
	sendEmailVerification: (req, res, next) => {
		userServices.sendEmailVerification(req, (err, data) => {
			err ? next(err) : res.json(formatResponse(data));
		});
	},
	verifyEmail: (req, res, next) => {
		userServices.verifyEmail(req, (err, data) => {
			err ? next(err) : res.json(formatResponse(data));
		});
	}
}

module.exports = userController;