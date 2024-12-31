const {
  University,
  UniversityGroup,
  UniversityRank,
  StateTerritory,
  UniversityCourse,
  CourseCategory,
  DegreeLevel
} = require('../models');
const { Op } = require('sequelize');
const createError = require('http-errors');

const universityServices = {
  getUniversities: async (req) => {
    const universities = await University.findAll({
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
  getStatesTerritories: async (req) => {
    const statesTerritories = await StateTerritory.findAll({
      attributes: ['id', 'name'],
      include: [
        {
          model: University,
          attributes: ['id', 'name', 'chName', 'emblemPic']
        }
      ],
      raw: true,
      nest: true
    });
    if (!statesTerritories) throw createError(500, 'Database error');
    return { success: true, statesTerritories };
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
    const { page, course, universityId, degreeLevelId, engReq, minFee, maxFee, categoryId } =
      req.query;

    const whereConditions = {};
    if (course) whereConditions.name = { [Op.like]: `%${course}%` };
    if (universityId) whereConditions['$University.id$'] = universityId;
    if (degreeLevelId) whereConditions['$DegreeLevel.id$'] = degreeLevelId;
    if (engReq) whereConditions.engReq = { [Op.lte]: engReq };
    if (minFee) whereConditions.minFee = { [Op.gte]: minFee };
    if (maxFee) whereConditions.maxFee = { [Op.lte]: maxFee };
    if (categoryId) whereConditions['$CourseCategory.id$'] = categoryId;

    const courses = await UniversityCourse.findAll({
      attributes: [
        'id',
        'name',
        'currencyId',
        'minFee',
        'maxFee',
        'engReq',
        'engReqInfo',
        'duration',
        'location',
        'courseUrl',
        'engReqUrl',
        'acadReqUrl',
        'feeDetailUrl'
      ],
      include: [
        {
          model: University,
          attributes: ['id', 'name', 'chName', 'emblemPic']
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
      limit: 10,
      offset: page ? (parseInt(page) - 1) * 10 : 0
    });
    if (!courses) throw createError(500, 'Database error');
    return { success: true, courses };
  }
};

module.exports = universityServices;
