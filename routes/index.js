const express = require('express');
const router = express.Router();
const { authenticated } = require('../middlewares/auth-middleware');
const users = require('./api/v1/users');
const auth = require('./api/v1/auth');

router.use('/api/v1/users', users);
router.use('/api/v1/auth', auth);

module.exports = router;
