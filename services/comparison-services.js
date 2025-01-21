import db from '../models/index.js';
const { Course, CourseComparison, University, UniversityRank } = db;
import addExtraProperty from '../lib/utils/addExtraProperty.js';
import helper from '../lib/utils/helper.js';
import createError from 'http-errors';

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
        'campus',
        'courseUrl'
      ],
      include: [
        {
          model: CourseComparison,
          as: 'courseComparison',
          where: { userId },
          attributes: []
        },
        {
          model: University,
          as: 'university',
          attributes: ['name', 'emblemPic'],
          include: [
            {
              model: UniversityRank,
              as: 'universityRank',
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
      if (course.university?.universityRank) {
        const {
          universityRank: { rank },
          ...universityWithoutRank
        } = course.university;
        return {
          ...course,
          university: {
            ...universityWithoutRank,
            rank
          }
        };
      }
      return course;
    });

    // 有使用者登入的情況下，查詢使用者的比較清單跟收藏清單
    await addExtraProperty.isFavorited(courses, userId);

    return { success: true, courses };
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

    // 比較清單上限為10
    const comparisonCount = await helper.getComparisonCount(userId);
    if (comparisonCount >= 10) throw createError(400, 'Comparison limit exceeded');

    await CourseComparison.create({
      userId,
      courseId
    });

    return {
      success: true,
      message: 'Course successfully added to comparison'
    };
  },
  removeComparison: async (req) => {
    const userId = req.user.id;
    const courseId = req.params.courseId;

    const comparison = await CourseComparison.findOne({
      where: { userId, courseId }
    });
    if (!comparison) throw createError(404, 'Course not found in comparison');

    await comparison.destroy();

    return {
      success: true,
      message: 'Course successfully removed from comparison'
    };
  }
};

export default comparisonServices;
