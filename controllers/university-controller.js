const universityServices = require('../services/university-services');
const { formatResponse } = require('../lib/utils/format-response');

const universityController = {
  getUniversities: async (req, res, next) => {
    try {
      const data = await universityServices.getUniversities(req);
      res.json(formatResponse(data));
    } catch (err) {
      next(err);
    }
  }
};

module.exports = universityController;
