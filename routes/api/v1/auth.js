const express = require('express');
const router = express.Router();
const authController = require('../../../controllers/auth-controller');
const formRules = require('../../../middlewares/form-validator/form-rules');
const validationHandler = require('../../../middlewares/form-validator/validation-handler');

router.post('/login', formRules.login, validationHandler, authController.login);
router.post('/logout', authController.logout);
router.post('/register', formRules.register, validationHandler, authController.register);
router.get('/verify', authController.verify);
router.get('/refresh', authController.refresh);

module.exports = router;