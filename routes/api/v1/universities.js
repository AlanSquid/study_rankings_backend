const express = require('express');
const router = express.Router();
const universityController = require('../../../controllers/university-controller');

router.get('/', universityController.getUniversities);

module.exports = router;
