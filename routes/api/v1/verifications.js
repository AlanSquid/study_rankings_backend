const express = require('express');
const router = express.Router();
const verificationController = require('../../../controllers/verification-controller');
const { emailLimiter, smsLimiter } = require('../../../middlewares/rate-limit');
const formRules = require('../../../middlewares/form-validator/form-rules');
const validationHandler = require('../../../middlewares/form-validator/validation-handler');
const { authenticated } = require('../../../middlewares/auth-middleware')

// 發送手機驗證碼
router.post('/phone',
  smsLimiter,
  formRules.sendSMS,
  validationHandler,
  verificationController.sendPhoneVerification
)
// 發送驗證email
router.post('/email',
  authenticated,
  emailLimiter,
  formRules.sendEmail,
  validationHandler,
  verificationController.sendEmailVerification
)
// 驗證email
router.post('/email/verify', verificationController.verifyEmail)

module.exports = router;