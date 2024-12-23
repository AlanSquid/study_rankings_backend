const axios = require("axios").default;
const createError = require('http-errors')

module.exports = {
  postSMS: async function (phone, code) {
    const prefixString = "【Study Rankings】verification code is:";
    const payload = {
      username: process.env.SMS_ACC,
      password: process.env.SMS_PW,
      mobile: phone,
      message: prefixString + code,
    };

    try {
      return await axios.get(process.env.SMS_URL, { params: payload });
    } catch (error) {
      console.error('SMS sending failed:', error.message);
      throw createError(502, 'SMS service error occurred');
    }
  }
}