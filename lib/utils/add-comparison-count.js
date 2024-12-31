const { CourseComparison } = require('../../models');

const addComparisonCount = async (user) => {
  if (!user) return;
  const comparisonCount = await CourseComparison.count({ where: { userId: user.id } });
  if (comparisonCount > 0) user.comparisonCount = comparisonCount;
};

module.exports = {
  addComparisonCount
};
