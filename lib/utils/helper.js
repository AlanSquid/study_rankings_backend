import db from '../../models/index.js';
const { CourseComparison } = db;

const helper = {
  getComparisonCount: async (userId) => {
    if (!userId) return 0;
    const comparisonCount = await CourseComparison.count({ where: { userId } });
    return comparisonCount;
  }
};

export default helper;
