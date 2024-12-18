const passport = require('passport')

const authenticated = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) return res.status(401).json({ success: false, error: 'unauthorized' })
    req.user = user
    next()
  })(req, res, next)
}

module.exports = {
  authenticated
}