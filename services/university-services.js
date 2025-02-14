// const sequelize = require('sequelize');
import db from '../models/index.js';
const {
  University,
  UniversityRank,
  CourseCategory,
  Course,
  StateTerritory,
  UniversityGroup,
  DegreeLevel
} = db;

import { Op, fn, col, where } from 'sequelize';
import addExtraProperty from '../lib/utils/addExtraProperty.js';
import createError from 'http-errors';

const universityServices = {
  getUniversities: async (req) => {
    const { universityGroupId, stateTerritoryId } = req.query;

    const whereConditions = {};
    if (universityGroupId) whereConditions['$universityGroup.id$'] = universityGroupId;
    if (stateTerritoryId) whereConditions['$stateTerritory.id$'] = stateTerritoryId;

    const universities = await University.findAll({
      where: whereConditions,
      attributes: ['id', 'name', 'chName', 'emblemPic'],
      include: [
        {
          model: StateTerritory,
          as: 'stateTerritory',
          attributes: ['id', 'name', 'chName']
        },
        {
          model: UniversityGroup,
          as: 'universityGroup',
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
          as: 'university',
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
      attributes: ['id', 'name', 'chName'],
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
      universityGroupId,
      sort
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
    if (universityId) whereConditions['$university.id$'] = universityId;
    if (degreeLevelId) whereConditions['$degreeLevel.id$'] = degreeLevelId;
    if (engReq) whereConditions.engReq = { [Op.lte]: engReq };
    if (minFee) whereConditions.maxFee = { [Op.gte]: minFee };
    if (maxFee) whereConditions.minFee = { [Op.lte]: maxFee };
    if (categoryId) whereConditions['$courseCategory.id$'] = categoryId;
    if (campus)
      whereConditions.campus = where(
        fn('lower', col('Course.campus')),
        'LIKE',
        `%${campus.toLowerCase()}%`
      );
    if (stateTerritoryId) whereConditions['$university.stateTerritory.id$'] = stateTerritoryId;
    if (universityGroupId) whereConditions['$university.universityGroup.id$'] = universityGroupId;

    // 設定排序條件
    let order = [];
    switch (sort) {
      case 'ea':
        order = [['eng_req', 'ASC']];
        break;
      case 'ed':
        order = [['eng_req', 'DESC']];
        break;
      case 'da':
        order = [['duration', 'ASC']];
        break;
      case 'dd':
        order = [['duration', 'DESC']];
        break;
      case 'fa':
        order = [['min_fee', 'ASC']];
        break;
      case 'fd':
        order = [['max_fee', 'DESC']];
        break;
      case 'na':
        order = [['name', 'ASC']];
        break;
      case 'nd':
        order = [['name', 'DESC']];
        break;
      default:
        order = [['name', 'ASC']]; // 預設排序
    }

    // 計算符合條件的總資料數
    const totalCount = await Course.count({
      where: whereConditions,
      include: [
        {
          model: University,
          as: 'university',
          include: [
            { model: StateTerritory, as: 'stateTerritory' },
            { model: UniversityGroup, as: 'universityGroup' }
          ]
        },
        { model: DegreeLevel, as: 'degreeLevel' },
        { model: CourseCategory, as: 'courseCategory' }
      ]
    });

    // 計算總頁數
    const totalPages = Math.ceil(totalCount / perPage);

    // 查詢符合條件的資料
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
          as: 'university',
          attributes: ['id', 'name', 'chName', 'emblemPic'],
          include: [
            {
              model: StateTerritory,
              as: 'stateTerritory',
              attributes: ['id', 'name']
            },
            {
              model: UniversityGroup,
              as: 'universityGroup',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: DegreeLevel,
          as: 'degreeLevel',
          attributes: ['id', 'name']
        },
        {
          model: CourseCategory,
          as: 'courseCategory',
          attributes: ['id', 'name']
        }
      ],
      where: whereConditions,
      order,
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

export default universityServices;
