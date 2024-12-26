const cron = require('node-cron');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { Verification } = require('../models')
const { Op } = require('sequelize');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Taipei');

// 每天 2:00 AM, 刪除過期的verification資料
cron.schedule('00 02 * * *', async () => {
  try {
    const verifications = await Verification.findAll({ where: { expiresAt: { [Op.lt]: dayjs().format() } } })
    if (verifications.length > 0) {
      for (let i = 0; i < verifications.length; i++) {
        await verifications[i].destroy()
      }
    }
  } catch (error) {
    console.log(error);
  }
});

