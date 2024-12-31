const { expect } = require('chai');
const sinon = require('sinon');
const {
  University,
  UniversityGroup,
  UniversityRank,
  StateTerritory,
  Course,
  CourseCategory,
  DegreeLevel
} = require('../../models');
const { Op } = require('sequelize');
const universityServices = require('../../services/university-services');
const createError = require('http-errors');

describe('university-services Unit Test', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getUniversities', () => {
    it('應回傳大學資料', async () => {
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

      const data = await universityServices.getUniversities({});

      expect(data.success).to.be.true;
      expect(data.universities).to.deep.equal(mockUniversities);
      expect(
        University.findAll.calledWith({
          attributes: ['id', 'name', 'chName', 'emblemPic'],
          include: [
            { model: StateTerritory, attributes: ['id', 'name'] },
            { model: UniversityGroup, attributes: ['id', 'name'] }
          ],
          raw: true,
          nest: true
        })
      ).to.be.true;
    });

    it('異常情境：資料庫錯誤應拋出500錯誤', async () => {
      sinon.stub(University, 'findAll').throws(createError(500, 'Database error'));

      try {
        await universityServices.getUniversities({});
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
          include: [{ model: University, attributes: ['id', 'name', 'chName', 'emblemPic'] }],
          order: [['id', 'ASC']],
          raw: true,
          nest: true
        })
      ).to.be.true;
    });

    it('異常情境：資料庫錯誤應拋出500錯誤', async () => {
      sinon.stub(UniversityRank, 'findAll').throws(createError(500, 'Database error'));

      try {
        await universityServices.getUniversityRanks({});
        expect.fail('預期應拋出500錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.message).to.equal('Database error');
        expect(error.status).to.equal(500);
      }
    });
  });

  describe('getStatesTerritories', () => {
    it('應回傳州和領地資料', async () => {
      const mockStatesTerritories = [
        {
          id: 1,
          name: 'State A',
          Universities: [{ id: 1, name: 'University A', chName: '大學A', emblemPic: 'emblemA.png' }]
        }
      ];

      sinon.stub(StateTerritory, 'findAll').resolves(mockStatesTerritories);

      const data = await universityServices.getStatesTerritories({});

      expect(data.success).to.be.true;
      expect(data.statesTerritories).to.deep.equal(mockStatesTerritories);
      expect(
        StateTerritory.findAll.calledWith({
          attributes: ['id', 'name'],
          include: [{ model: University, attributes: ['id', 'name', 'chName', 'emblemPic'] }],
          raw: true,
          nest: true
        })
      ).to.be.true;
    });

    it('異常情境：資料庫錯誤應拋出500錯誤', async () => {
      sinon.stub(StateTerritory, 'findAll').throws(createError(500, 'Database error'));

      try {
        await universityServices.getStatesTerritories({});
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
          attributes: ['id', 'name'],
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
          engReqInfo: 'IELTS 5.0',
          duration: '4 years',
          location: 'Campus A',
          courseUrl: 'http://courseA.com',
          engReqUrl: 'http://engReqA.com',
          acadReqUrl: 'http://acadReqA.com',
          feeDetailUrl: 'http://feeDetailA.com',
          University: { id: 1, name: 'University A', chName: '大學A', emblemPic: 'emblemA.png' },
          DegreeLevel: { id: 1, name: 'Bachelor' },
          CourseCategory: { id: 1, name: 'Category A' }
        }
      ];

      sinon.stub(Course, 'findAll').resolves(mockCourses);

      const data = await universityServices.getCourses(req);

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
            'location',
            'courseUrl',
            'engReqUrl',
            'acadReqUrl',
            'feeDetailUrl'
          ],
          include: [
            { model: University, attributes: ['id', 'name', 'chName', 'emblemPic'] },
            { model: DegreeLevel, attributes: ['id', 'name'] },
            { model: CourseCategory, attributes: ['id', 'name'] }
          ],
          where: {
            name: { [Op.like]: `%${req.query.course}%` },
            '$University.id$': req.query.universityId,
            '$DegreeLevel.id$': req.query.degreeLevelId,
            engReq: { [Op.lte]: req.query.engReq },
            minFee: { [Op.gte]: req.query.minFee },
            maxFee: { [Op.lte]: req.query.maxFee },
            '$CourseCategory.id$': req.query.categoryId
          },
          limit: 10,
          offset: (req.query.page - 1) * 10
        })
      ).to.be.true;
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
