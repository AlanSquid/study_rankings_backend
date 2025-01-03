const { University, UniversityRank, Course, CourseComparison } = require('../models');
const createError = require('http-errors');

const comparisonServices = {
  getComparisons: async (req) => {
    const userId = req.user.id;
    const coursesRaw = await Course.findAll({
      attributes: [
        'id',
        'name',
        'minFee',
        'maxFee',
        'engReq',
        'engReqInfo',
        'duration',
        'location'
      ],
      include: [
        {
          model: CourseComparison,
          where: { userId },
          attributes: []
        },
        {
          model: University,
          attributes: ['name', 'emblemPic'],
          include: [
            {
              model: UniversityRank,
              attributes: ['rank']
            }
          ]
        }
      ],
      raw: true,
      nest: true
    });
    // 簡化巢狀結構，將 UniversityRank 的 rank 放到 University 的屬性中
    const courses = coursesRaw.map((course) => {
      if (course.University && course.University.UniversityRank) {
        const { UniversityRank, ...universityWithoutRank } = course.University;
        return {
          ...course,
          University: {
            ...universityWithoutRank,
            rank: UniversityRank.rank
          }
        };
      }
      return course;
    });

    const comparisonCount = courses.length;

    return { success: true, comparisonCount, courses };
  },
  addComparison: async (req) => {
    const userId = req.user.id;
    const courseId = req.params.courseId;

    const course = await Course.findByPk(courseId);
    if (!course) throw createError(404, 'Course not found');

    const comparison = await CourseComparison.findOne({
      where: { userId, courseId }
    });
    if (comparison) throw createError(409, 'Course already exists in comparison');

    await CourseComparison.create({
      userId,
      courseId
    });

    const comparisonCount = await CourseComparison.count({ where: { userId } });

    return { success: true, comparisonCount, message: 'Course successfully added to comparison' };
  },
  removeComparison: async (req) => {
    const userId = req.user.id;
    const courseId = req.params.courseId;

    const comparison = await CourseComparison.findOne({
      where: { userId, courseId }
    });
    if (!comparison) throw createError(404, 'Course not found in comparison');

    await comparison.destroy();
    const comparisonCount = await CourseComparison.count({ where: { userId } });

    return {
      success: true,
      comparisonCount,
      message: 'Course successfully removed from comparison'
    };
  }
};

module.exports = comparisonServices;
