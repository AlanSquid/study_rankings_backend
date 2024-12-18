const { User } = require('../models')

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
    }
}

module.exports = userServices;