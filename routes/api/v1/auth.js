const express = require('express');
const router = express.Router();
const authController = require('../../../controllers/auth-controller');
const formRules = require('../../../middlewares/form-validator/form-rules');
const validationHandler = require('../../../middlewares/form-validator/validation-handler');

// 登入
router.post('/login', formRules.login, validationHandler, authController.login);
// 登出
router.post('/logout', authController.logout);
// 註冊
router.post('/register', formRules.register, validationHandler, authController.register);
// 驗證token
router.get('/verify-jwt', authController.verifyJWT);
// 更新access token
router.get('/refresh', authController.refresh);

module.exports = router;