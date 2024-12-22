const { body } = require('express-validator');
const { smsVerification } = require('../../lib/verification');

const formRules = {
  register: [
    body('name').notEmpty().withMessage('Name is required'),
    body('phone')
      .notEmpty().withMessage('Phone number is required')
      .matches(/^09\d{8}$/).withMessage('Please enter a valid phone number'),
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please enter a valid email'),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword')
      .notEmpty().withMessage('Confirm password is required')
      // value就是confirmPassword
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      }),
    body('verificationCode')
      .notEmpty().withMessage('Verification code is required')
      // value就是verificationCode
      .custom(async (value, { req }) => {
        try {
          await smsVerification.verifyPhone(req.body.phone, value);
        } catch (error) {
          throw new Error('Verification code is invalid');
        }
      })
  ],
  login: [
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  sendSMS: [
    body('phone')
      .notEmpty().withMessage('Phone number is required')
      .matches(/^09\d{8}$/).withMessage('Please enter a valid phone number'),
  ],
  sendEmail: [
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please enter a valid email'),
  ]
};

module.exports = formRules;