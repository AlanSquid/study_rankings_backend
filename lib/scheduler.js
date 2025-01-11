import cron from 'node-cron';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { baseVerification } from '../lib/verification.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Taipei');

// 每天 2:00 AM, 刪除過期的驗證紀錄
cron.schedule('00 02 * * *', async () => {
  try {
    await baseVerification.clearExpiredVerifications();
  } catch (error) {
    console.error(error);
  }
});
