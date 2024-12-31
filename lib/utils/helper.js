const { CourseComparison } = require('../../models');

const helper = {
  getComparisonCount: async (userId) => {
    if (!userId) return 0;
    const comparisonCount = await CourseComparison.count({ where: { userId } });
    return comparisonCount;
  }
};

module.exports = helper;
