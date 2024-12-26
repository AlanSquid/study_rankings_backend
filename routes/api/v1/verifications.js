const express = require('express');
const router = express.Router();
const verificationController = require('../../../controllers/verification-controller');
const { emailLimiter, smsLimiter, smsLimiterMax } = require('../../../middlewares/rate-limit');
const formRules = require('../../../middlewares/form-validator/form-rules');
const validationHandler = require('../../../middlewares/form-validator/validation-handler');
const { authenticated } = require('../../../middlewares/auth-middleware')

// 發送手機驗證碼
router.post('/phone',
  formRules.sendSMS,
  validationHandler,
  smsLimiter,
  smsLimiterMax,
  verificationController.sendPhoneVerification
)
// 發送驗證email
router.post('/email',
  authenticated,
  formRules.sendEmail,
  validationHandler,
  emailLimiter,
  verificationController.sendEmailVerification
)
// 驗證email
router.post('/email/verify',
  formRules.verifyEmail,
  validationHandler,
  verificationController.verifyEmail
)
// 發送重置密碼email
router.post('/reset-pwd/',
  formRules.sendResetPasswordEmail,
  validationHandler,
  verificationController.sendResetPasswordEmail
)
// 驗證重置密碼email
router.post('/reset-pwd/verify',
  formRules.verifyResetPassword,
  validationHandler,
  verificationController.verifyResetPassword
)

module.exports = router;