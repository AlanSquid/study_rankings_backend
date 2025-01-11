import express from 'express';
const router = express.Router();
import universityController from '../../../controllers/university-controller.js';
import { optionalAuthenticator } from '../../../middlewares/auth-middleware.js';

router.get('/', universityController.getUniversities);
router.get('/ranks', universityController.getUniversityRanks);
router.get('/courses', optionalAuthenticator, universityController.getCourses);
router.get('/courses/categories', universityController.getCourseCategories);

export default router;
