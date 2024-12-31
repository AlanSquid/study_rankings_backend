const express = require('express');
const router = express.Router();

const users = require('./api/v1/users');
const auth = require('./api/v1/auth');
const verifications = require('./api/v1/verifications');
const universities = require('./api/v1/universities');
const comparisons = require('./api/v1/comparisons');
const { authenticator } = require('../middlewares/auth-middleware');

router.use('/api/v1/users', users);
router.use('/api/v1/auth', auth);
router.use('/api/v1/verifications', verifications);
router.use('/api/v1/universities', universities);
router.use('/api/v1/comparisons', authenticator, comparisons);

module.exports = router;
