const { User } = require('../models')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const passport = require('passport')

const authServices = {
  verify: async (req, cb) => {
    try {
      passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err || !user) {
          return cb({ status: 401, message: 'Unauthorized' }, null )
        }
        return cb(null, { user})
      })(req)
    } catch (err) {
      cb(err, null);
    }
  },
  refresh: async (req, cb) => {
    try {
      const refreshToken = req.cookies.refreshToken
      if (!refreshToken) {
        return cb({ status: 401, message: 'Unauthorized: Please login or token expired' }, null)
      }

      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) {
          return cb({ status: 401, message: 'Unauthorized: Please login or token expired' }, null)
        }

        // 產生新的 access token
        const userData = {
          id: user.id,
          phone: user.phone,
          name: user.name
        }

        const accessToken = jwt.sign(userData, process.env.JWT_ACCESS_SECRET, {
          expiresIn: '15m'
        })

        return cb(null, { accessToken })
      })
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

        // 產生 access token (較短期)
        const accessToken = jwt.sign(userData, process.env.JWT_ACCESS_SECRET, {
          expiresIn: '15m'
        })

        // 產生 refresh token (較長期)
        const refreshToken = jwt.sign(userData, process.env.JWT_REFRESH_SECRET, {
          expiresIn: '7d'
        })

        return cb(null, refreshToken, { user, accessToken })
      })(req)
    } catch (err) {
      cb(err, null);
    }
  },
  logout: async (req, cb) => {
    try {
      return cb(null, { message: 'Logged out' })
    } catch (err) {
      cb(err, null);
    }
  },
  register: async (req, cb) => {
    try {
      const { name, phone, email, password, confirmPassword } = req.body

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


      // 產生 access token (較短期)
      const accessToken = jwt.sign(userData, process.env.JWT_ACCESS_SECRET, {
        expiresIn: '15m'
      })

      // 產生 refresh token (較長期)
      const refreshToken = jwt.sign(userData, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d'
      })

      return cb(null, refreshToken, { userData, accessToken })
    } catch (err) {
      cb(err, null);
    }
  }
}

module.exports = authServices;