const express = require('express');
const router = express.Router();
const authController = require('../../../controllers/auth-controller');
const authValidator = require('../../../middlewares/form-validator/auth-validator');
const handleValidation = require('../../../middlewares/form-validator/handle-validation');

router.post('/login', authValidator.login, handleValidation, authController.login);
router.post('/logout', authController.logout);
router.post('/register', authValidator.register, handleValidation, authController.register);
router.get('/verify', authController.verify);
router.get('/refresh', authController.refresh);

module.exports = router;