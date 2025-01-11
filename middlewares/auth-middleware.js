import passport from 'passport';

const authenticator = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user)
      return res.status(401).json({
        success: false,
        status: 401,
        message: 'Unauthorized'
      });
    req.user = user;
    next();
  })(req, res, next);
};

const optionalAuthenticator = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }
    req.user = user || null;
    next();
  })(req, res, next);
};

export { authenticator, optionalAuthenticator };
