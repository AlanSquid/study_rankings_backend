import express from 'express';
const router = express.Router();
import comparisonController from '../../../controllers/comparison-controller.js';

router.get('/', comparisonController.getComparisons);
router.post('/:courseId', comparisonController.addComparison);
router.delete('/:courseId', comparisonController.removeComparison);

export default router;
