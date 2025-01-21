import verificationServices from '../services/verification-services.js';
import formatResponse from '../lib/utils/formatResponse.js';

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

export default verificationController;
