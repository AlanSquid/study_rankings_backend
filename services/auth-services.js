const { User } = require('../models')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const passport = require('passport')

const authServices = {
  verify: async (req, cb) => {
    try {
      passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err || !user) {
          return cb({ status: 401, message: 'Unauthorized: Please login or token expired' }, null)
        }
        return cb(null, { user })
      })(req)
    } catch (err) {
      cb(err, null);
    }
  },
  login: async (req, cb) => {
    try {
      passport.authenticate('local', { session: false }, (err, user) => {
        if (err || !user) {
          return cb({ status: 401, message: 'Login failed' }, null)
        }

        // 產生 JWT token
        const userData = {
          id: user.id,
          phone: user.phone,
          name: user.name
        }
        const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' })

        return cb(null, { user, token })
      })(req)
    } catch (err) {
      cb(err, null);
    }
  },
  register: async (req, cb) => {
    try {
      const { name, phone, email, password, confirmPassword } = req.body

      // 檢查必要欄位
      const errors = {};
      
      if (!name) errors.name = 'Name is required';
      if (!phone) errors.phone = 'Phone number is required';
      if (!email) errors.email = 'Email is required';
      if (!password) errors.password = 'Password is required';
      if (!confirmPassword) errors.confirmPassword = 'Confirm password is required';
      
      if (Object.keys(errors).length > 0) {
        return cb({ 
          message: 'Please fill in all required fields',
          errors 
        }, null);
      }

      // 檢查密碼是否一致
      if (password !== confirmPassword) {
        return cb({ message: 'Passwords do not match' }, null)
      }

      // 檢查使用者是否已存在
      const existingUser = await User.findOne({ where: { phone } })
      if (existingUser) {
        return cb({ message: 'Phone number already registered' }, null)
      }

      // 密碼雜湊
      const hashedPassword = await bcrypt.hash(password, 10)

      // 建立新使用者
      const newUser = await User.create({
        name,
        phone,
        email,
        password: hashedPassword,
        is_phone_verified: false,
        is_email_verified: false
      })

      // 移除密碼後準備回傳的使用者資料
      const userData = {
        id: newUser.id,
        phone: newUser.phone,
        name: newUser.name
      }

      // 產生 JWT token
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' })

      // 回傳結果
      return cb(null, {
        user: userData,
        token
      })
    } catch (err) {
      cb(err, null);
    }
  }
}

module.exports = authServices;