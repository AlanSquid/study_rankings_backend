const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation error',
      errors: errors.array().reduce((acc, curr) => {
        acc[curr.path] = curr.msg;
        return acc;
      }, {})
    });
  }
  next();
};

module.exports = handleValidation;