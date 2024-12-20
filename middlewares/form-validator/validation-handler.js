const { validationResult } = require('express-validator');

const validationHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Validation error',
      errors: errors.array().reduce((acc, curr) => {
        acc[curr.path] = curr.msg;
        return acc;
      }, {})
    });
  }
  next();
};

module.exports = validationHandler;