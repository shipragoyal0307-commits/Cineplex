const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName, phone, city } = req.body;
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: existingUser.username === username ? 'Username already taken' : 'Email already registered' });
    }
    const user = await User.create({ username, email, password, fullName, phone, city });
    const token = generateToken(user._id);
    res.status(201).json({ success: true, message: 'Account created successfully!', token, user });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' });
    }
    const user = await User.findOne({ $or: [{ username }, { email: username }] }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = generateToken(user._id);
    res.json({ success: true, message: 'Login successful!', token, user: user.toJSON() });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;