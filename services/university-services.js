// const sequelize = require('sequelize');
const {
  University,
  UniversityGroup,
  UniversityRank,
  StateTerritory,
  Course,
  CourseCategory,
  DegreeLevel
} = require('../models');
const { Op, fn, col, where } = require('sequelize');
const addExtraProperty = require('../lib/utils/addExtraProperty');
const createError = require('http-errors');

const universityServices = {
  getUniversities: async (req) => {
    const { universityGroupId, stateTerritoryId } = req.query;

    const whereConditions = {};
    if (universityGroupId) whereConditions['$UniversityGroup.id$'] = universityGroupId;
    if (stateTerritoryId) whereConditions['$StateTerritory.id$'] = stateTerritoryId;

    const universities = await University.findAll({
      where: whereConditions,
      attributes: ['id', 'name', 'chName', 'emblemPic'],
      include: [
        {
          model: StateTerritory,
          attributes: ['id', 'name']
        },
        {
          model: UniversityGroup,
          attributes: ['id', 'name']
        }
      ],
      raw: true,
      nest: true
    });
    if (!universities) throw createError(500, 'Database error');
    return { success: true, universities };
  },
  getUniversityRanks: async (req) => {
    const ranks = await UniversityRank.findAll({
      attributes: ['id', 'rank'],
      include: [
        {
          model: University,
          attributes: ['id', 'name', 'chName', 'emblemPic']
        }
      ],
      order: [['id', 'ASC']],
      raw: true,
      nest: true
    });
    if (!ranks) throw createError(500, 'Database error');
    return { success: true, ranks };
  },
  getCourseCategories: async (req) => {
    const courseCategories = await CourseCategory.findAll({
      attributes: ['id', 'name'],
      raw: true
    });
    if (!courseCategories) throw createError(500, 'Database error');
    return { success: true, courseCategories };
  },
  getCourses: async (req) => {
    const user = req.user || null;
    const isAuthenticated = !!user;
    const {
      page,
      course,
      universityId,
      degreeLevelId,
      engReq,
      minFee,
      maxFee,
      categoryId,
      campus,
      stateTerritoryId,
      universityGroupId
    } = req.query;

    // 每頁顯示 10 筆資料
    const perPage = 10;

    // 設定查詢條件
    const whereConditions = {};
    if (course)
      whereConditions.name = where(
        fn('lower', col('Course.name')),
        'LIKE',
        `%${course.toLowerCase()}%`
      );
    if (universityId) whereConditions['$University.id$'] = universityId;
    if (degreeLevelId) whereConditions['$DegreeLevel.id$'] = degreeLevelId;
    if (engReq) whereConditions.engReq = { [Op.lte]: engReq };
    if (minFee) whereConditions.minFee = { [Op.gte]: minFee };
    if (maxFee) whereConditions.maxFee = { [Op.lte]: maxFee };
    if (categoryId) whereConditions['$CourseCategory.id$'] = categoryId;
    if (campus)
      whereConditions.campus = where(
        fn('lower', col('Course.campus')),
        'LIKE',
        `%${campus.toLowerCase()}%`
      );
    if (stateTerritoryId) whereConditions['$University.StateTerritory.id$'] = stateTerritoryId;
    if (universityGroupId) whereConditions['$University.UniversityGroup.id$'] = universityGroupId;

    // 計算符合條件的總資料數
    const totalCount = await Course.count({
      where: whereConditions,
      include: [
        { model: University, include: [{ model: StateTerritory }, { model: UniversityGroup }] },
        { model: DegreeLevel },
        { model: CourseCategory }
      ]
    });

    // 計算總頁數
    const totalPages = Math.ceil(totalCount / perPage);

    const courses = await Course.findAll({
      attributes: [
        'id',
        'name',
        'currencyId',
        'minFee',
        'maxFee',
        'engReq',
        'engReqInfo',
        'duration',
        'campus',
        'courseUrl',
        'engReqUrl',
        'acadReqUrl',
        'feeDetailUrl'
      ],
      include: [
        {
          model: University,
          attributes: ['id', 'name', 'chName', 'emblemPic'],
          include: [
            {
              model: StateTerritory,
              attributes: ['id', 'name']
            },
            {
              model: UniversityGroup,
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: DegreeLevel,
          attributes: ['id', 'name']
        },
        {
          model: CourseCategory,
          attributes: ['id', 'name']
        }
      ],
      where: whereConditions,
      limit: perPage,
      offset: page ? (parseInt(page) - 1) * perPage : 0,
      raw: true,
      nest: true
    });
    if (!courses) throw createError(500, 'Database error');

    // 有使用者登入的情況下，查詢使用者的比較清單跟收藏清單
    if (user) {
      await addExtraProperty.isCompared(courses, user.id);
      await addExtraProperty.isFavorited(courses, user.id);
    }

    return { success: true, courses, totalPages, isAuthenticated };
  }
};

module.exports = universityServices;
