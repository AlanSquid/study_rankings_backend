const { body } = require('express-validator');
const { User } = require('../../models');
const { smsVerification } = require('../../lib/verification');

const formRules = {
  register: [
    body('name')
      .notEmpty().withMessage('Name is required')
      .isLength({ max: 50 }).withMessage('Name must not exceed 50 characters'),
    body('phone')
      .notEmpty().withMessage('Phone number is required')
      .matches(/^09\d{8}$/).withMessage('Please enter a valid phone number')
      .isLength({ max: 10 }).withMessage('Phone number must not exceed 10 characters'),
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please enter a valid email')
      .isLength({ max: 50 }).withMessage('Email must not exceed 50 characters'),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .isLength({ max: 50 }).withMessage('Password must not exceed 50 characters'),
    body('confirmPassword')
      .notEmpty().withMessage('Confirm password is required')
      .isLength({ max: 50 }).withMessage('Confirm password must not exceed 50 characters')
      // value就是confirmPassword
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      }),
    body('verificationCode')
      .notEmpty().withMessage('Verification code is required')
      .isLength({ max: 50 }).withMessage('Verification code must not exceed 50 characters')
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
    body('phone')
      .notEmpty().withMessage('Phone number is required')
      .isLength({ max: 10 }).withMessage('Phone number must not exceed 10 characters'),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ max: 50 }).withMessage('Password must not exceed 50 characters')
  ],
  updatePassword: [
    body('oldPassword')
      .notEmpty().withMessage('Old password is required')
      .isLength({ max: 50 }).withMessage('Password must not exceed 50 characters'),
    body('newPassword')
      .notEmpty().withMessage('New password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .isLength({ max: 50 }).withMessage('Password must not exceed 50 characters')
      .custom((value, { req }) => {
        if (value === req.body.oldPassword) {
          throw new Error('New password must be different from old password');
        }
        return true;
      }),
    body('confirmPassword')
      .notEmpty().withMessage('Confirm password is required')
      .isLength({ max: 50 }).withMessage('Confirm password must not exceed 50 characters')
      // value就是confirmPassword
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Passwords do not match');
        }
        return true;
      }),
  ],
  sendSMS: [
    body('phone')
      .notEmpty().withMessage('Phone number is required')
      .matches(/^09\d{8}$/).withMessage('Please enter a valid phone number')
      .isLength({ max: 10 }).withMessage('Phone number must not exceed 10 characters')
      // value就是phone
      .custom(async (value) => {
        const user = await User.findOne({ where: { phone: value } });
        if (user) {
          throw new Error('Phone number is already registered');
        }
        return true;
      }),
  ],
  sendEmail: [
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please enter a valid email')
      .isLength({ max: 50 }).withMessage('Email must not exceed 50 characters'),

  ]
};

module.exports = formRules;