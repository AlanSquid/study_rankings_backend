const { CourseComparison } = require('../../models');

const getComparisonCount = async (userId) => {
  if (!userId) return 0;
  const comparisonCount = await CourseComparison.count({ where: { userId } });
  return comparisonCount;
};

module.exports = {
  getComparisonCount
};
