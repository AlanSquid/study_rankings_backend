const { User } = require('../models')
const { smsVerification, emailVerification } = require('../lib/verification');
const createError = require('http-errors')

const userServices = {
	getUser: async (req) => {
		const userId = req.params.id;
		const user = await User.findOne({
			where: { id: userId },
			attributes: ['id', 'name', 'email', 'phone'],
			raw: true
		});
		if (!user) {
			throw createError(404, 'User not found')
		}

		return { success: true, user };
	}
}

module.exports = userServices;