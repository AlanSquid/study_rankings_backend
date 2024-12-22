const userServices = require('../services/user-services');
const { formatResponse } = require('../lib/utils/format-response');

const userController = {
	getUser: async (req, res, next) => {
		try {
			const data = await userServices.getUser(req)
			res.json(formatResponse(data))
		} catch (err) {
			next(err)
		}
	},
	sendPhoneVerification: async (req, res, next) => {
		try {
			const data = await userServices.sendPhoneVerification(req)
			res.json(formatResponse(data))
		} catch (err) {
			next(err)
		}

	},
	sendEmailVerification: async (req, res, next) => {
		try {
			const data = await userServices.sendEmailVerification(req)
			res.json(formatResponse(data))
		} catch (err) {
			next(err)
		}
	},
	verifyEmail: async (req, res, next) => {
		try {
			const data = await userServices.verifyEmail(req)
			res.json(formatResponse(data))
		} catch (err) {
			next(err)
		}
	}
}

module.exports = userController;