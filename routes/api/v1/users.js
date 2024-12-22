const express = require('express');
const router = express.Router();
const userController = require('../../../controllers/user-controller');
const formRules = require('../../../middlewares/form-validator/form-rules');
const validationHandler = require('../../../middlewares/form-validator/validation-handler');
const { authenticated } = require('../../../middlewares/auth-middleware')
const { emailLimiter, smsLimiter } = require('../../../middlewares/rate-limit');

// 取得使用者資料
router.get('/profile/:id', userController.getUser)
// 發送手機驗證碼
router.post('/verifications/phone',
  smsLimiter,
  formRules.sendSMS,
  validationHandler,
  userController.sendPhoneVerification
)
// 發送驗證email
router.post('/verifications/email',
  authenticated,
  emailLimiter,
  formRules.sendEmail,
  validationHandler,
  userController.sendEmailVerification
)
// 驗證email
router.post('/verifications/email/verify', userController.verifyEmail)


module.exports = router;