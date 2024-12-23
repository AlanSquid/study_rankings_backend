const { User } = require('../models')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const createError = require('http-errors')

const authServices = {
  verifyJWT: async (req) => {
    const user = req.user
    return { success: true, user }
  },
  refresh: async (req) => {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
      throw createError(401, 'Unauthorized: Please login or token expired')
    }

    const user = await new Promise((resolve, reject) => {
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) {
          return reject(createError(401, 'Unauthorized: Please login or token expired'))
        }
        resolve(user)
      })
    })

    // 產生新的 access token
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: '15m'
    })

    return { success: true, accessToken }
  },
  login: async (req) => {
    const user = await new Promise((resolve, reject) => {
      passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) {
          return reject(createError(500, err.message))
        }
        if (!user) {
          return reject(createError(401, info?.message || 'Login failed'))
        }
        resolve(user)
      })(req)
    })

    // 產生 tokens
    const [accessToken, refreshToken] = await Promise.all([
      jwt.sign({ id: user.id }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: '15m'
      }),
      jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d'
      })
    ])

    // accessToken回傳json給前端，refreshToken回傳httpOnly cookie
    return { success: true, user, accessToken, refreshToken }
  },
  logout: async (req) => {
    return { success: true, message: 'Logged out' }
  },
  register: async (req) => {
    const { name, phone, email, password } = req.body

    // 檢查使用者是否已存在
    const existingUser = await User.findOne({
      where: {
        phone,
        isPhoneVerified: true
      }
    })
    if (existingUser) {
      throw createError(409, 'Phone number already registered')
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

    const user = {
      id: newUser.id,
      name: newUser.name,
      phone: newUser.phone,
      email: newUser.email,
    }


    // 產生 tokens
    const [accessToken, refreshToken] = await Promise.all([
      jwt.sign({ id: user.id }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: '15m'
      }),
      jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d'
      })
    ])

    // accessToken回傳json給前端，refreshToken回傳httpOnly cookie
    return { success: true, user, accessToken, refreshToken }
  }
}

module.exports = authServices;