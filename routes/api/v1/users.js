const express = require('express');
const router = express.Router();
const userController = require('../../../controllers/user-controller');
const formRules = require('../../../middlewares/form-validator/form-rules');
const validationHandler = require('../../../middlewares/form-validator/validation-handler');
const { authenticator } = require('../../../middlewares/auth-middleware');

// 取得使用者資料
router.get('/profile', authenticator, userController.getUser);
// 修改密碼
router.patch('/profile/password', authenticator, userController.updatePassword);
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
router.post('/favorites/:id', authenticator, userController.addFavorite);
// 刪除favorite
router.delete('/favorites/:id', authenticator, userController.deleteFavorite);

module.exports = router;
