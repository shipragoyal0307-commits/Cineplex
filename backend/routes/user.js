const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { protect } = require('../middleware/auth');

// GET /api/user/profile
router.get('/profile', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// PUT /api/user/profile - Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const allowedFields = ['fullName', 'phone', 'city', 'notifications'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated!', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

// PUT /api/user/change-password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Password change failed' });
  }
});

module.exports = router;
