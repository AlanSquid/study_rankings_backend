const express = require('express');
const router = express.Router();
const users = require('./api/v1/users');

router.use('/api/v1/users', users);

module.exports = router;
