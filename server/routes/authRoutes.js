const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
<<<<<<< HEAD
const { register, getImageOptions, login, getMe, forgotPassword, verifyResetOTP, resetPassword } = require('../controllers/authController');
=======
const { register, getImageOptions, login, verifyOtp, getMe } = require('../controllers/authController');
>>>>>>> b97bbb32d0c8551870d3359f1936254876a71444
const { protect } = require('../middleware/auth');
const { authRateLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');

// ── POST /auth/register ───────────────────────────────────────
router.post(
  '/register',
  authRateLimiter,
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required.')
      .isLength({ max: 100 }).withMessage('Name must be 100 characters or fewer.'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required.')
      .isEmail().withMessage('Please enter a valid email address.')
      .normalizeEmail(),
    body('imageCategory')
      .optional()
      .isIn(['mixed', 'animals', 'food', 'vehicles', 'nature', 'objects', 'technology', 'symbols', 'tools'])
      .withMessage('Invalid image category selected.'),
    body('cues')
      .isArray({ min: 3, max: 5 })
      .withMessage('You must provide between 3 and 5 memory cues.'),
    body('cues.*')
      .trim()
      .matches(/^[a-zA-Z0-9!@#$%^&*_+=\-?.,]{1,6}$/)
      .withMessage('Each memory cue must be 1–6 alphanumeric or special characters.'),
    body('imageSequence')
      .isArray({ min: 3, max: 5 })
      .withMessage('Image sequence must match the number of cues.'),
    body('imageSequence.*')
      .trim()
      .notEmpty().withMessage('Each image selection is required.'),
  ],
  validate,
  register
);

// ── GET /auth/image-options ───────────────────────────────────
router.get('/image-options', getImageOptions);

// ── POST /auth/login ──────────────────────────────────────────
router.post(
  '/login',
  authRateLimiter,
  [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required.')
      .isEmail().withMessage('Please enter a valid email address.')
      .normalizeEmail(),
  ],
  validate,
  login
);

<<<<<<< HEAD
// ── Forgot Password ──────────────────────────────────────────
router.post('/forgot-password', authRateLimiter, forgotPassword);
router.post('/verify-otp', authRateLimiter, verifyResetOTP);
router.post('/reset-password', authRateLimiter, resetPassword);
=======
// ── POST /auth/verify-otp ──────────────────────────────────
router.post(
  '/verify-otp',
  [
    body('userId').notEmpty().withMessage('userId is required.'),
    body('otp')
      .trim()
      .notEmpty().withMessage('OTP is required.')
      .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits.')
      .isNumeric().withMessage('OTP must contain only digits.'),
  ],
  validate,
  verifyOtp
);
>>>>>>> b97bbb32d0c8551870d3359f1936254876a71444

// ── GET /auth/me ──────────────────────────────────────────────
router.get('/me', protect, getMe);

module.exports = router;
