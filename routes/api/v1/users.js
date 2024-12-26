const express = require('express');
const router = express.Router();
const userController = require('../../../controllers/user-controller');
const formRules = require('../../../middlewares/form-validator/form-rules');
const validationHandler = require('../../../middlewares/form-validator/validation-handler');
const { authenticated } = require('../../../middlewares/auth-middleware')


// 取得使用者資料
router.get('/profile', authenticated, userController.getUser)
// 修改密碼
router.patch('/profile/password', authenticated, userController.updatePassword)
// 重置密碼
router.patch('/profile/password/reset', formRules.resetPassword, validationHandler, userController.resetPassword)
// 修改email
router.patch('/profile/email', authenticated, userController.updateEmail)

module.exports = router;