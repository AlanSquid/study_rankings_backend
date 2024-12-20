const authServices = require('../services/auth-services');
const { formatResponse } = require('../lib/format-response');

const authController = {
    verifyJWT: (req, res, next) => {
        authServices.verifyJWT(req, (err, data) => {
            err ? next(err) : res.json(formatResponse(data));
        });
    },
    refresh: (req, res, next) => {
        authServices.refresh(req, (err, data) => {
            err ? next(err) : res.json(formatResponse(data));
        });
    },
    login: (req, res, next) => {
        authServices.login(req, (err, refreshToken, data) => {
            if (err) return next(err);
            // 設定 refresh token 為 HTTP-only cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7天
            })
            return res.json(formatResponse(data));
        });
    },
    logout: (req, res, next) => {
        authServices.logout(req, (err, data) => {
            if (err) return next(err);
            res.clearCookie('refreshToken');
            return res.json(formatResponse(data));
        })
    },
    register: (req, res, next) => {
        authServices.register(req, (err, refreshToken, data) => {
            if (err) return next(err);
            // 設定 refresh token 為 HTTP-only cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7天
            })
            return res.json(formatResponse(data));
        });
    }
};

module.exports = authController;