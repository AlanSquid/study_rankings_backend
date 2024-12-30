const verificationServices = require('../services/verification-services');
const { formatResponse } = require('../lib/utils/format-response');

const verificationController = {
  sendPhoneVerification: async (req, res, next) => {
    try {
      const data = await verificationServices.sendPhoneVerification(req);
      res.json(formatResponse(data));
    } catch (err) {
      next(err);
    }
  },
  sendEmailVerification: async (req, res, next) => {
    try {
      const data = await verificationServices.sendEmailVerification(req);
      res.json(formatResponse(data));
    } catch (err) {
      next(err);
    }
  },
  verifyEmail: async (req, res, next) => {
    try {
      const data = await verificationServices.verifyEmail(req);
      res.json(formatResponse(data));
    } catch (err) {
      next(err);
    }
  },
  sendResetPasswordEmail: async (req, res, next) => {
    try {
      const data = await verificationServices.sendResetPasswordEmail(req);
      res.json(formatResponse(data));
    } catch (err) {
      next(err);
    }
  },
  verifyResetPassword: async (req, res, next) => {
    try {
      const data = await verificationServices.verifyResetPassword(req);
      res.json(formatResponse(data));
    } catch (err) {
      next(err);
    }
  }
};

module.exports = verificationController;
