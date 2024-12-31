const express = require('express');
const router = express.Router();
const comparisonController = require('../../../controllers/comparison-controller');

router.get('/', comparisonController.getComparisons);
router.post('/:courseId', comparisonController.addComparison);

module.exports = router;
