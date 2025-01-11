import models from '../../models/index.js';
const { CourseComparison } = models;

const helper = {
  getComparisonCount: async (userId) => {
    if (!userId) return 0;
    const comparisonCount = await CourseComparison.count({ where: { userId } });
    return comparisonCount;
  }
};

export default helper;
