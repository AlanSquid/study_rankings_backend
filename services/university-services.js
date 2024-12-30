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
    return { success: true, statesTerritories };
  },
  getCourseCategories: async (req) => {
    const courseCategories = await CourseCategory.findAll({
      attributes: ['id', 'name'],
      raw: true
    });
    return { success: true, courseCategories };
  },
  getCourses: async (req) => {
    const { page, course, university, degreeLevelId, engReq, minFee, maxFee, categoryId } =
      req.query;

    const whereConditions = {};
    if (course) whereConditions.name = { [Op.like]: `%${course}%` };
    if (university) whereConditions['$University.name$'] = { [Op.like]: `%${university}%` };
    if (degreeLevelId) whereConditions['$DegreeLevel.id$'] = degreeLevelId;
    if (engReq) whereConditions.engReq = { [Op.like]: `%${engReq}%` };
    if (minFee) whereClause.minTuitionFees = { [Op.gte]: minFee };
    if (maxFee) whereClause.maxTuitionFees = { [Op.lte]: maxFee };
    if (categoryId) whereConditions['$CourseCategory.id$'] = categoryId;

    const courses = await UniversityCourse.findAll({
      attributes: [
        'id',
        'name',
        'currencyId',
        'minTuitionFees',
        'maxTuitionFees',
        'engReq',
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
          attributes: ['id', 'name']
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
      offset: page ? (parseInt(page) - 1) * 10 : 0,
      raw: true,
      nest: true
    });
    return { success: true, courses };
  }
};

module.exports = universityServices;
