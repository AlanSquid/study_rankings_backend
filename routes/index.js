const express = require('express');
const router = express.Router();

const users = require('./api/v1/users');
const auth = require('./api/v1/auth');
const verifications = require('./api/v1/verifications');
const universities = require('./api/v1/universities');

router.use('/api/v1/users', users);
router.use('/api/v1/auth', auth);
router.use('/api/v1/verifications', verifications);
router.use('/api/v1/universities', universities);

module.exports = router;
