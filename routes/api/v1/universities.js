const express = require('express');
const router = express.Router();
const universityController = require('../../../controllers/university-controller');

router.get('/', universityController.getUniversities);
router.get('/ranks', universityController.getUniversityRanks);
router.get('/states-territories', universityController.getStatesTerritories);
router.get('/courses', universityController.getCourses);
router.get('/courses/categories', universityController.getCourseCategories);

module.exports = router;
