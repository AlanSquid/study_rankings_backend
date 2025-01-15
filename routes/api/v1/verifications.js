import express from 'express';
const router = express.Router();
import verificationController from '../../../controllers/verification-controller.js';
import { emailLimiter, smsLimiter, smsLimiterMax } from '../../../middlewares/rate-limit.js';
import formRules from '../../../middlewares/form-validator/form-rules.js';
import validationHandler from '../../../middlewares/form-validator/validation-handler.js';
import { authenticator } from '../../../middlewares/auth-middleware.js';

// 發送手機驗證碼
router.post(
  '/phone',
  formRules.sendSMS,
  validationHandler,
  smsLimiter,
  smsLimiterMax,
  verificationController.sendPhoneVerification
);
// 發送驗證email
router.post(
  '/email',
  authenticator,
  formRules.sendEmail,
  validationHandler,
  emailLimiter,
  verificationController.sendEmailVerification
);
// 驗證email
router.post(
  '/email/verify',
  formRules.verifyEmail,
  validationHandler,
  verificationController.verifyEmail
);
// 發送重置密碼email
router.post(
  '/reset-pwd/',
  formRules.sendResetPasswordEmail,
  validationHandler,
  verificationController.sendResetPasswordEmail
);
// 驗證重置密碼email
router.post(
  '/reset-pwd/verify',
  formRules.verifyResetPassword,
  validationHandler,
  verificationController.verifyResetPassword
);

export default router;
