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
	updatePassword: async (req, res, next) => {
		try {
			const data = await userServices.updatePassword(req)
			res.json(formatResponse(data))
		} catch (err) {
			next(err)
		}
	}
}

module.exports = userController;