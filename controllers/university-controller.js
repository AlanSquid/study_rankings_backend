import universityServices from '../services/university-services.js';
import formatResponse from '../lib/utils/formatResponse.js';

const universityController = {
  getUniversities: async (req, res, next) => {
    try {
      const data = await universityServices.getUniversities(req);
      res.json(formatResponse(data));
    } catch (err) {
      next(err);
    }
  },
  getUniversityRanks: async (req, res, next) => {
    try {
      const data = await universityServices.getUniversityRanks(req);
      res.json(formatResponse(data));
    } catch (err) {
      next(err);
    }
  },
  getCourses: async (req, res, next) => {
    try {
      const data = await universityServices.getCourses(req);
      res.json(formatResponse(data));
    } catch (err) {
      next(err);
    }
  },
  getCourseCategories: async (req, res, next) => {
    try {
      const data = await universityServices.getCourseCategories(req);
      res.json(formatResponse(data));
    } catch (err) {
      next(err);
    }
  }
};

export default universityController;
