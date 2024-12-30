const { University } = require('../models');

const universityServices = {
  getUniversities: async (req) => {
    const universities = await University.findAll();
    return { success: true, universities };
  }
};

module.exports = universityServices;
