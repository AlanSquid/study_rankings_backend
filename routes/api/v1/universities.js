const express = require('express');
const router = express.Router();
const universityController = require('../../../controllers/university-controller');
const { optionalAuthenticator } = require('../../../middlewares/auth-middleware');

router.get('/', universityController.getUniversities);
router.get('/ranks', universityController.getUniversityRanks);
router.get('/courses', optionalAuthenticator, universityController.getCourses);
router.get('/courses/categories', universityController.getCourseCategories);

module.exports = router;
