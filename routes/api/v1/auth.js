const express = require('express');
const router = express.Router();
const authController = require('../../../controllers/auth-controller');
const authValidator = require('../../../middlewares/form-validator/auth-validator');
const validateRequest = require('../../../middlewares/form-validator/validate-request');

router.post('/login', authValidator.login, validateRequest, authController.login);
router.post('/register', authValidator.register, validateRequest, authController.register);
router.get('/verify', authController.verify);

module.exports = router;