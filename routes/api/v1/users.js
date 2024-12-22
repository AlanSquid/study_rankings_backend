const express = require('express');
const router = express.Router();
const userController = require('../../../controllers/user-controller');
const { authenticated } = require('../../../middlewares/auth-middleware')


// 取得使用者資料
router.get('/profile/:id',authenticated, userController.getUser)

module.exports = router;