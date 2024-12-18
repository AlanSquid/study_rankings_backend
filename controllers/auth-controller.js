const { verify } = require('jsonwebtoken');
const authServices = require('../services/auth-services');

const authController = {
    verify: (req, res, next) => {
        authServices.verify(req, (err, data) => {
            err ? next(err) : res.json({ success: true, data });
        });
    },
    login: (req, res, next) => {
        authServices.login(req, (err, data) => {
            err ? next(err) : res.json({ success: true, data });
        });
    },
    register: (req, res, next) => {
        authServices.register(req, (err, data) => {
            err ? next(err) : res.json({ success: true, data });
        });
    }
};

module.exports = authController;