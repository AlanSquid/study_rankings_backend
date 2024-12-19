const express = require('express');
const router = express.Router();
const userController = require('../../../controllers/user-controller');

router.get('/', userController.getUsers)
router.post('/verify/phone', userController.sendPhoneVerification)
router.post('/verify/email', userController.verifyEmail)
router.get('/verify/email/:token')


module.exports = router;