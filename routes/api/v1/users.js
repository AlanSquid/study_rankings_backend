const express = require('express');
const router = express.Router();
const userController = require('../../../controllers/user-controller');

router.get('/', userController.getUsers)
router.get('/verification/phone-code', userController.sendPhoneVerification)
router.get('/verification/email', userController.verifyEmail)
router.get('/verify/email/:token')


module.exports = router;