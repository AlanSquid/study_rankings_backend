const { expect } = require('chai');
const sinon = require('sinon');
const { University, UniversityRank, Course, CourseComparison } = require('../../models');
const comparisonServices = require('../../services/comparison-services');
const createError = require('http-errors');
const helper = require('../../lib/utils/helper');

describe('comparison-services Unit Test', () => {
  describe('getComparisons', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('正常情境：應回傳比較清單', async () => {
      const req = { user: { id: 1 } };
      const mockCourses = [
        {
          id: 1,
          name: 'Course 1',
          minFee: 30000,
          maxFee: 40000,
          engReq: 6.5,
          engReqInfo: 'IELTS 6.5',
          duration: 2,
          location: 'Location 1',
          University: {
            name: 'University 1',
            emblemPic: 'pic1.jpg',
            UniversityRank: { rank: '1' }
          }
        }
      ];

      sinon.stub(Course, 'findAll').resolves(mockCourses);

      const data = await comparisonServices.getComparisons(req);

      expect(data.success).to.be.true;
      expect(data.courses).to.deep.equal([
        {
          id: 1,
          name: 'Course 1',
          minFee: 30000,
          maxFee: 40000,
          engReq: 6.5,
          engReqInfo: 'IELTS 6.5',
          duration: 2,
          location: 'Location 1',
          University: {
            name: 'University 1',
            emblemPic: 'pic1.jpg',
            rank: '1'
          }
        }
      ]);
    });

    it('異常情境：無法取得比較清單時應拋出錯誤', async () => {
      const req = { user: { id: 1 } };

      sinon.stub(Course, 'findAll').rejects(new Error('Database error'));

      try {
        await comparisonServices.getComparisons(req);
        expect.fail('預期應拋出錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.message).to.equal('Database error');
      }
    });
  });

  describe('addComparison', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('正常情境：應成功新增比較項目', async () => {
      const req = { user: { id: 1 }, params: { courseId: 1 } };
      const mockCourse = { id: 1 };

      sinon.stub(Course, 'findByPk').resolves(mockCourse);
      sinon.stub(CourseComparison, 'findOne').resolves(null);
      sinon.stub(helper, 'getComparisonCount').resolves(5);
      sinon.stub(CourseComparison, 'create').resolves();

      const data = await comparisonServices.addComparison(req);

      expect(data.success).to.be.true;
      expect(data.message).to.equal('Course successfully added to comparison');
    });

    it('異常情境：課程不存在時應拋出404錯誤', async () => {
      const req = { user: { id: 1 }, params: { courseId: 999 } };

      sinon.stub(Course, 'findByPk').resolves(null);

      try {
        await comparisonServices.addComparison(req);
        expect.fail('預期應拋出404錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(404);
        expect(error.message).to.equal('Course not found');
      }
    });

    it('異常情境：課程已存在於比較清單時應拋出409錯誤', async () => {
      const req = { user: { id: 1 }, params: { courseId: 1 } };
      const mockComparison = { id: 1 };

      sinon.stub(Course, 'findByPk').resolves({ id: 1 });
      sinon.stub(CourseComparison, 'findOne').resolves(mockComparison);

      try {
        await comparisonServices.addComparison(req);
        expect.fail('預期應拋出409錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(409);
        expect(error.message).to.equal('Course already exists in comparison');
      }
    });

    it('異常情境：比較清單超過上限時應拋出400錯誤', async () => {
      const req = { user: { id: 1 }, params: { courseId: 1 } };

      sinon.stub(Course, 'findByPk').resolves({ id: 1 });
      sinon.stub(CourseComparison, 'findOne').resolves(null);
      sinon.stub(helper, 'getComparisonCount').resolves(11);

      try {
        await comparisonServices.addComparison(req);
        expect.fail('預期應拋出400錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(400);
        expect(error.message).to.equal('Comparison limit exceeded');
      }
    });
  });

  describe('removeComparison', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('正常情境：應成功移除比較項目', async () => {
      const req = { user: { id: 1 }, params: { courseId: 1 } };
      const mockComparison = { destroy: sinon.stub().resolves() };

      sinon.stub(CourseComparison, 'findOne').resolves(mockComparison);

      const data = await comparisonServices.removeComparison(req);

      expect(data.success).to.be.true;
      expect(data.message).to.equal('Course successfully removed from comparison');
    });

    it('異常情境：比較項目不存在時應拋出404錯誤', async () => {
      const req = { user: { id: 1 }, params: { courseId: 999 } };

      sinon.stub(CourseComparison, 'findOne').resolves(null);

      try {
        await comparisonServices.removeComparison(req);
        expect.fail('預期應拋出404錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(404);
        expect(error.message).to.equal('Course not found in comparison');
      }
    });
  });
});
