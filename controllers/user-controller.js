const userServices = require('../services/user-services');

const userController = {
	getUsers: (req, res, next) => {
		userServices.getUsers(req, (err, data) => {
			err ? next(err) : res.json({ success: true, data });
		});
	}
}

module.exports = userController;