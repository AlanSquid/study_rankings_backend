import express from 'express';
const router = express.Router();
import authController from '../../../controllers/auth-controller.js';
import formRules from '../../../middlewares/form-validator/form-rules.js';
import validationHandler from '../../../middlewares/form-validator/validation-handler.js';

// 登入
router.post('/login', formRules.login, validationHandler, authController.login);
// 登出
router.post('/logout', authController.logout);
// 註冊
router.post('/register', formRules.register, validationHandler, authController.register);
// 更新access token
router.post('/refresh', authController.refresh);

export default router;
