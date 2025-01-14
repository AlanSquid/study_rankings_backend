import { expect } from 'chai';
import sinon from 'sinon';

import db from '../../models/index.js';
const {
  University,
  UniversityGroup,
  UniversityRank,
  StateTerritory,
  Course,
  CourseCategory,
  DegreeLevel
} = db;
import { Op, fn, col, where, or } from 'sequelize';
import addExtraProperty from '../../lib/utils/addExtraProperty.js';
import universityServices from '../../services/university-services.js';
import createError from 'http-errors';

describe('university-services Unit Test', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getUniversities', () => {
    it('應回傳大學資料', async () => {
      const req = {
        query: {
          universityGroupId: 1,
          stateTerritoryId: 1
        }
      };

      const mockUniversities = [
        {
          id: 1,
          name: 'University A',
          chName: '大學A',
          emblemPic: 'emblemA.png',
          StateTerritory: { id: 1, name: 'State A' },
          UniversityGroup: { id: 1, name: 'Group A' }
        }
      ];

      sinon.stub(University, 'findAll').resolves(mockUniversities);

      const data = await universityServices.getUniversities(req);

      expect(data.success).to.be.true;
      expect(data.universities).to.deep.equal(mockUniversities);
      expect(
        University.findAll.calledWith({
          where: {
            '$UniversityGroup.id$': 1,
            '$StateTerritory.id$': 1
          },
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
          ],
          raw: true,
          nest: true
        })
      ).to.be.true;
    });

    it('應回傳符合查詢條件的大學資料', async () => {
      const req = {
        query: {
          universityGroupId: 1
        }
      };

      const mockUniversities = [
        {
          id: 1,
          name: 'University A',
          chName: '大學A',
          emblemPic: 'emblemA.png',
          StateTerritory: { id: 1, name: 'State A' },
          UniversityGroup: { id: 1, name: 'Group A' }
        }
      ];

      sinon.stub(University, 'findAll').resolves(mockUniversities);

      const data = await universityServices.getUniversities(req);

      expect(data.success).to.be.true;
      expect(data.universities).to.deep.equal(mockUniversities);
      expect(
        University.findAll.calledWith({
          where: {
            '$UniversityGroup.id$': 1
          },
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
          ],
          raw: true,
          nest: true
        })
      ).to.be.true;
    });

    it('異常情境：資料庫錯誤應拋出500錯誤', async () => {
      const req = {
        query: {
          universityGroupId: 1,
          stateTerritoryId: 1
        }
      };
      sinon.stub(University, 'findAll').throws(createError(500, 'Database error'));

      try {
        await universityServices.getUniversities(req);
        expect.fail('預期應拋出500錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.message).to.equal('Database error');
        expect(error.status).to.equal(500);
      }
    });
  });

  describe('getUniversityRanks', () => {
    it('應回傳大學排名資料', async () => {
      const mockRanks = [
        {
          id: 1,
          rank: 1,
          University: { id: 1, name: 'University A', chName: '大學A', emblemPic: 'emblemA.png' }
        }
      ];

      sinon.stub(UniversityRank, 'findAll').resolves(mockRanks);

      const data = await universityServices.getUniversityRanks({});

      expect(data.success).to.be.true;
      expect(data.ranks).to.deep.equal(mockRanks);
      expect(
        UniversityRank.findAll.calledWith({
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
        })
      ).to.be.true;
    });

    it('異常情境：資料庫錯誤應拋出500錯誤', async () => {
      sinon.stub(UniversityRank, 'findAll').throws(createError(500, 'Database error'));

      try {
        await universityServices.getUniversityRanks();
        expect.fail('預期應拋出500錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.message).to.equal('Database error');
        expect(error.status).to.equal(500);
      }
    });
  });

  describe('getCourseCategories', () => {
    it('應回傳課程分類資料', async () => {
      const mockCourseCategories = [{ id: 1, name: 'Category A' }];

      sinon.stub(CourseCategory, 'findAll').resolves(mockCourseCategories);

      const data = await universityServices.getCourseCategories({});

      expect(data.success).to.be.true;
      expect(data.courseCategories).to.deep.equal(mockCourseCategories);
      expect(
        CourseCategory.findAll.calledWith({
          attributes: ['id', 'name', 'chName'],
          raw: true
        })
      ).to.be.true;
    });

    it('異常情境：資料庫錯誤應拋出500錯誤', async () => {
      sinon.stub(CourseCategory, 'findAll').throws(createError(500, 'Database error'));

      try {
        await universityServices.getCourseCategories({});
        expect.fail('預期應拋出500錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.message).to.equal('Database error');
        expect(error.status).to.equal(500);
      }
    });
  });

  describe('getCourses', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('應回傳課程資料', async () => {
      const req = {
        query: {
          page: 1,
          course: 'Course A',
          universityId: 1,
          degreeLevelId: 1,
          engReq: 5,
          minFee: 1000,
          maxFee: 5000,
          categoryId: 1,
          campus: 'Campus',
          stateTerritoryId: 1,
          universityGroupId: 1,
          sort: 'ea'
        }
      };

      const mockCourses = [
        {
          id: 1,
          name: 'Course A',
          currencyId: 'USD',
          minFee: 1000,
          maxFee: 5000,
          engReq: 5,
          engReqInfo: 'IELTS 5.0',
          duration: '4 years',
          campus: 'Campus A',
          courseUrl: 'http://courseA.com',
          engReqUrl: 'http://engReqA.com',
          acadReqUrl: 'http://acadReqA.com',
          feeDetailUrl: 'http://feeDetailA.com',
          University: {
            id: 1,
            name: 'University A',
            chName: '大學A',
            emblemPic: 'emblemA.png',
            StateTerritory: { id: 1, name: 'State A' },
            UniversityGroup: { id: 1, name: 'Group A' }
          },
          DegreeLevel: { id: 1, name: 'Bachelor' },
          CourseCategory: { id: 1, name: 'Category A' }
        }
      ];

      sinon.stub(Course, 'findAll').resolves(mockCourses);
      sinon.stub(Course, 'count').resolves(10);

      const data = await universityServices.getCourses(req);

      expect(data.totalPages).to.equal(1);
      expect(data.success).to.be.true;
      expect(data.courses).to.deep.equal(mockCourses);
      expect(
        Course.findAll.calledWith({
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
          where: {
            name: where(
              fn('lower', col('Course.name')),
              'LIKE',
              `%${req.query.course.toLowerCase()}%`
            ),
            '$University.id$': req.query.universityId,
            '$DegreeLevel.id$': req.query.degreeLevelId,
            engReq: { [Op.lte]: req.query.engReq },
            maxFee: { [Op.gte]: req.query.minFee },
            minFee: { [Op.lte]: req.query.maxFee },
            '$CourseCategory.id$': req.query.categoryId,
            campus: where(
              fn('lower', col('Course.campus')),
              'LIKE',
              `%${req.query.campus.toLowerCase()}%`
            ),
            '$University.StateTerritory.id$': req.query.stateTerritoryId,
            '$University.UniversityGroup.id$': req.query.universityGroupId
          },
          order: [['eng_req', 'ASC']],
          limit: 10,
          offset: (req.query.page - 1) * 10,
          raw: true,
          nest: true
        })
      ).to.be.true;
    });

    it('使用者登入情況:應回傳包含isCompared跟isFavorited的課程資料', async () => {
      const req = {
        user: { id: 1 },
        query: {
          page: 1,
          course: 'Course A',
          universityId: 1,
          degreeLevelId: 1,
          engReq: 5,
          minFee: 1000,
          maxFee: 5000,
          categoryId: 1
        }
      };

      const mockCourses = [
        {
          id: 1,
          name: 'Course A',
          currencyId: 'USD',
          minFee: 1000,
          maxFee: 5000,
          engReq: 5,
          engReqInfo: 'TOEFL',
          duration: '4 years',
          campus: 'Campus A',
          courseUrl: 'http://courseA.com',
          engReqUrl: 'http://engReqA.com',
          acadReqUrl: 'http://acadReqA.com',
          feeDetailUrl: 'http://feeDetailA.com',
          University: { id: 1, name: 'University A', chName: '大學A', emblemPic: 'emblemA.png' },
          DegreeLevel: { id: 1, name: 'Bachelor' },
          CourseCategory: { id: 1, name: 'Category A' },
          isCompared: true,
          isFavorited: true
        }
      ];

      sinon.stub(Course, 'findAll').resolves(mockCourses);
      sinon.stub(addExtraProperty, 'isCompared').resolves({});
      sinon.stub(addExtraProperty, 'isFavorited').resolves({});
      sinon.stub(Course, 'count').resolves(10);

      const data = await universityServices.getCourses(req);

      expect(data.totalPages).to.equal(1);
      expect(data.success).to.be.true;
      expect(data.courses).to.deep.equal(mockCourses);
      expect(data.courses[0].isCompared).to.be.true;
      expect(data.courses[0].isFavorited).to.be.true;
      expect(addExtraProperty.isCompared.calledOnce).to.be.true;
      expect(addExtraProperty.isFavorited.calledOnce).to.be.true;
    });

    it('異常情境：資料庫錯誤應拋出500錯誤', async () => {
      const req = {
        query: {
          page: 1,
          course: 'Course A',
          universityId: 1,
          degreeLevelId: 1,
          engReq: 5,
          minFee: 1000,
          maxFee: 5000,
          categoryId: 1
        }
      };

      sinon.stub(Course, 'findAll').throws(createError(500, 'Database error'));
      sinon.stub(Course, 'count').resolves(10);

      try {
        await universityServices.getCourses(req);
        expect.fail('預期應拋出500錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.message).to.equal('Database error');
        expect(error.status).to.equal(500);
      }
    });
  });
});
