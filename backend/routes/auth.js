const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

// Password strength validator
const passwordValidation = body('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
  .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
  .matches(/[0-9]/).withMessage('Password must contain at least one number')
  .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character');

// Username validation
const usernameValidation = body('username')
  .isLength({ min: 6, max: 20 }).withMessage('Username must be 6-20 characters')
  .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores')
  .matches(/[a-zA-Z]/).withMessage('Username must contain at least one letter');

// @route  POST /api/auth/register
router.post('/register', [
  usernameValidation,
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('fullName').notEmpty().withMessage('Full name is required').trim(),
  passwordValidation
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { username, email, password, fullName, phone, city } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ success: false, message: 'Username already taken. Try another.' });
      }
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({ username, email, password, fullName, phone, city });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ success: false, message: `${field} already exists.` });
    }
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// @route  POST /api/auth/login
router.post('/login', [
  body('username').notEmpty().withMessage('Username or email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    // Find by username or email
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = generateToken(user._id);
    const userObj = user.toJSON();

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: userObj
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// @route  GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;