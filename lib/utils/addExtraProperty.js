import models from '../../models/index.js';
const { CourseComparison, CourseFavorite } = models;

const addExtraProperty = {
  isFavorited: async (courseArr, userId) => {
    const favorites = await CourseFavorite.findAll({
      where: { userId },
      attributes: ['courseId'],
      raw: true
    });
    const favoritesCourseIdArr = favorites.map((favorite) => favorite.courseId);
    // 將課程資料標記是否加入收藏
    courseArr.forEach((course) => {
      course.isFavorited = favoritesCourseIdArr.includes(course.id);
    });
    return courseArr;
  },
  isCompared: async (courseArr, userId) => {
    const comparisons = await CourseComparison.findAll({
      where: { userId },
      attributes: ['courseId'],
      raw: true
    });
    const comparisonCourseIdArr = comparisons.map((comparison) => comparison.courseId);
    // 將課程資料標記是否加入比較
    courseArr.forEach((course) => {
      course.isCompared = comparisonCourseIdArr.includes(course.id);
    });
    return courseArr;
  }
};

export default addExtraProperty;
