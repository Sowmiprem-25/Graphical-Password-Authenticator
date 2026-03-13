const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, getImageOptions, login, getMe, forgotPassword, verifyOtp, resetPassword } = require('../controllers/authController');
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

// ── Forgot Password ──────────────────────────────────────────
router.post('/forgot-password', authRateLimiter, forgotPassword);
router.post('/verify-otp', authRateLimiter, verifyOtp);
router.post('/reset-password', authRateLimiter, resetPassword);

// ── GET /auth/me ──────────────────────────────────────────────
router.get('/me', protect, getMe);

module.exports = router;
