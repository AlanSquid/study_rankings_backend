const cron = require('node-cron');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { baseVerification } = require('../lib/verification')

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Taipei');

// 每天 2:00 AM, 刪除過期的驗證紀錄
cron.schedule('00 02 * * *', async () => {
  try {
    await baseVerification.clearExpiredVerifications()
  } catch (error) {
    console.log(error);
  }
});

