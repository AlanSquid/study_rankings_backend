import express from 'express';
const router = express.Router();
import userController from '../../../controllers/user-controller.js';
import formRules from '../../../middlewares/form-validator/form-rules.js';
import validationHandler from '../../../middlewares/form-validator/validation-handler.js';
import { authenticator } from '../../../middlewares/auth-middleware.js';

// 取得使用者資料
router.get('/profile', authenticator, userController.getUser);
// 修改密碼
router.patch(
  '/profile/password',
  authenticator,
  formRules.updatePassword,
  validationHandler,
  userController.updatePassword
);
// 重置密碼
router.patch(
  '/profile/password/reset',
  formRules.resetPassword,
  validationHandler,
  userController.resetPassword
);
// 修改email
router.patch(
  '/profile/email',
  authenticator,
  formRules.updateEmail,
  validationHandler,
  userController.updateEmail
);
// 修改姓名
router.patch(
  '/profile/name',
  authenticator,
  formRules.updateName,
  validationHandler,
  userController.updateName
);
// 獲取favorite
router.get('/favorites', authenticator, userController.getFavorites);
// 新增favorite
router.post('/favorites/:courseId', authenticator, userController.addFavorite);
// 刪除favorite
router.delete('/favorites/:courseId', authenticator, userController.deleteFavorite);

export default router;
