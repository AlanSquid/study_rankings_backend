import comparisonServices from '../services/comparison-services.js';
import formatResponse from '../lib/utils/formatResponse.js';

const comparisonController = {
  getComparisons: async (req, res, next) => {
    try {
      const comparisons = await comparisonServices.getComparisons(req);
      res.json(formatResponse(comparisons));
    } catch (err) {
      next(err);
    }
  },
  addComparison: async (req, res, next) => {
    try {
      const comparison = await comparisonServices.addComparison(req);
      res.json(formatResponse(comparison));
    } catch (err) {
      next(err);
    }
  },
  removeComparison: async (req, res, next) => {
    try {
      const comparison = await comparisonServices.removeComparison(req);
      res.json(formatResponse(comparison));
    } catch (err) {
      next(err);
    }
  }
};

export default comparisonController;
