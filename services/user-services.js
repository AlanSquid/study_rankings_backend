const { User } = require('../models')

const userServices = {
    getUsers: async (req, cb) => {
        try {
            const users = await User.findAll({
                attributes: ['id', 'name', 'email', 'phone', 'isEmailVerified', 'isPhoneVerified']
            });
            return cb(null, users);

        } catch (err) {
            cb(err, null);
        }
    }
}

module.exports = userServices;