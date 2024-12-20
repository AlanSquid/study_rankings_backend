const express = require('express');
const router = express.Router();
const userController = require('../../../controllers/user-controller');
const { emailLimiter, smsLimiter } = require('../../../middlewares/rate-limit');

// 取得使用者資料
router.get('/profile/:id', userController.getUser)
// 發送手機驗證碼
router.post('/phone-code',smsLimiter, userController.sendPhoneVerification)
// 發送驗證email
router.post('/email-code',emailLimiter, userController.sendEmailVerification)
// 驗證email
router.post('/verification/email', userController.verifyEmail)


module.exports = router;