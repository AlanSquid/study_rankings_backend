const passport = require('passport')
const LocalStrategy = require('passport-local')
const passportJWT = require('passport-jwt')
const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt
const bcrypt = require('bcryptjs')
const { User } = require('../models')

require('dotenv').config();

module.exports = app => {
  app.use(passport.initialize());

  // 本地登入策略
  passport.use(new LocalStrategy(
    // customize user field
    {
      usernameField: 'phone',
      passwordField: 'password',
      passReqToCallback: true
    },
    // authenticate user
    async (req, phone, password, done) => {
      try {
        const userData = await User.findOne({ where: { phone } })
        if (!userData) {
          return done(null, false, { message: 'User not found' })
        }

        const isPasswordValid = await bcrypt.compare(password, userData.password)
        if (!isPasswordValid) {
          return done(null, false, { message: 'Incorrect phone or password' })
        }
        const user = userData.toJSON()
        delete user.password
        
        return done(null, user, { message: 'Logged In Successfully' })

      } catch (err) {
        return done(err)
      }
    }
  ))

  // JWT 策略
  passport.use(new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET
    },
    async (jwtPayload, done) => {
      try {
        const userData = await User.findByPk(jwtPayload.id, {
          attributes: { exclude: ['password'] }
        })
        if (!userData) {
          return done(null, false, { message: 'User not found' })
        }
        const user = userData.toJSON()
        delete user.password

        return done(null, user)

      } catch (err) {
        return done(err)
      }
    }
  ))
}