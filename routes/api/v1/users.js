const express = require('express');
const router = express.Router();
const userController = require('../../../controllers/user-controller');

router.get('/', userController.getUsers)
router.post('/phone-code', userController.sendPhoneVerification)
router.post('/email-code', userController.sendEmailVerification)
router.post('/verification/email', userController.verifyEmail)


module.exports = router;