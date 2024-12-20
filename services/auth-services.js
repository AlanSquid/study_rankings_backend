const { User, Verification } = require('../models')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const { smsVerification } = require('../lib/verification')

const authServices = {
  verifyJWT: async (req, cb) => {
    try {
      passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err || !user) {
          return cb({ status: 401, message: 'Unauthorized' }, null)
        }
        return cb(null, { user })
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
        const accessToken = jwt.sign({ id: user.id }, process.env.JWT_ACCESS_SECRET, {
          expiresIn: '15m'
        })

        return cb(null, { success: true, accessToken })
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


        // 產生 access token (較短期)
        const accessToken = jwt.sign({ id: user.id }, process.env.JWT_ACCESS_SECRET, {
          expiresIn: '15m'
        })

        // 產生 refresh token (較長期)
        const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
          expiresIn: '7d'
        })

        return cb(null, refreshToken, { success: true, user, accessToken })
      })(req)
    } catch (err) {
      cb(err, null);
    }
  },
  logout: async (req, cb) => {
    try {
      return cb(null, { success: true, message: 'Logged out' })
    } catch (err) {
      cb(err, null);
    }
  },
  register: async (req, cb) => {
    try {
      const { name, phone, email, password, verificationCode } = req.body

      // 檢查使用者是否已存在
      const existingUser = await User.findOne({
        where: {
          phone,
          isPhoneVerified: true
        }
      })
      if (existingUser) {
        return cb({ status: 400, message: 'Phone number already registered' }, null)
      }

      // 驗證手機
      const isPhoneVerified = await smsVerification.verifyCode(phone, verificationCode)
      if (!isPhoneVerified) {
        return cb({ status: 400, message: 'Phone Verification failed' }, null)
      }

      // 密碼雜湊
      const hashedPassword = await bcrypt.hash(password, 10)

      // 建立新使用者
      const newUser = await User.create({
        name,
        phone,
        email,
        password: hashedPassword,
        isPhoneVerified: true,
        isEmailVerified: false
      })

      await Verification.update(
        { userId: newUser.id, },
        {
          where: {
            target: phone,
            type: 'phone',
            isUsed: true
          }
        })

        const user = {
          id: newUser.id,
          name: newUser.name,
          phone: newUser.phone,
          email: newUser.email,
        }


      // 產生 access token (較短期)
      const accessToken = jwt.sign({ id: user.id }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: '15m'
      })

      // 產生 refresh token (較長期)
      const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d'
      })

      return cb(null, refreshToken, { success: true, user, accessToken })
    } catch (err) {
      cb(err, null);
    }
  }
}

module.exports = authServices;