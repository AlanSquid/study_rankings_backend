import { expect } from 'chai';
import sinon from 'sinon';
import supertest from 'supertest';
import app from '../../../app.js';
import { execSync } from 'child_process';
import db from '../../../models/index.js';
const { Verification } = db;
import { Op } from 'sequelize';
import smsService from '../../../lib/sms.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Taipei');

const request = supertest(app);

before(async () => {
  // 初始化資料庫
  execSync('npm run db-init', { stdio: 'inherit' });
  // 執行假資料
  execSync(
    'npx sequelize db:seed --seeders-path seeders/fakes --seed 20241230073156-create-fake-courses.cjs',
    { stdio: 'inherit' }
  );
});

describe('POST /verifications/phone', () => {
  afterEach(async () => {
    // 清理資料庫中的Verification資料
    await Verification.destroy({ where: {}, truncate: true });
    sinon.restore();
  });

  it('正常情況', async () => {
    // 模擬簡訊發送
    const smsServiceMock = sinon.mock(smsService);
    smsServiceMock
      .expects('postSMS')
      .once()
      .resolves({ code: '00000', text: 'Success', msgid: 123456789 });

    const payload = { phone: '0987002093' };
    const now = dayjs();
    const response = await request
      .post('/api/v1/verifications/phone')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(200);

    // 要建立一筆Verification資料
    const verification = await Verification.findOne({
      where: { target: payload.phone, type: 'phone', expiresAt: { [Op.gt]: now } },
      raw: true
    });

    smsServiceMock.verify();
    expect(verification).to.deep.include({
      target: payload.phone,
      type: 'phone',
      expiresAt: verification.expiresAt
    });
    // 驗證碼要是六位數字
    expect(verification.code).to.match(/^\d{6}$/);
    expect(response.body).to.deep.equal({
      success: true,
      message: 'Verification SMS sent'
    });
  });
});
