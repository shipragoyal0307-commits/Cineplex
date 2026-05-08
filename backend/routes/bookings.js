const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// POST /api/bookings - Create booking
router.post('/', protect, async (req, res) => {
  try {
    const { movieId, theater, showDate, showTime, format, seats, totalAmount, discount, couponUsed, foodOrders, paymentMethod } = req.body;

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });

    const finalAmount = totalAmount - (discount || 0);

    const booking = await Booking.create({
      user: req.user._id,
      movie: movieId,
      movieTitle: movie.title,
      moviePoster: movie.poster,
      theater,
      showDate: new Date(showDate),
      showTime,
      format,
      seats,
      totalAmount,
      discount: discount || 0,
      finalAmount,
      couponUsed,
      foodOrders,
      paymentMethod
    });

    // Update movie booking count
    await Movie.findByIdAndUpdate(movieId, { $inc: { totalBookings: seats.length } });

    // Award loyalty points (1 point per ₹10 spent)
    const pointsEarned = Math.floor(finalAmount / 10);
    await User.findByIdAndUpdate(req.user._id, { $inc: { loyaltyPoints: pointsEarned } });

    res.status(201).json({
      success: true,
      message: 'Booking confirmed!',
      booking,
      pointsEarned
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Booking failed. Please try again.' });
  }
});

// GET /api/bookings/my - Get user's bookings
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('movie', 'title poster genre duration')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching bookings' });
  }
});

// PATCH /api/bookings/:id/cancel
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking already cancelled' });
    }

    const showDateTime = new Date(`${booking.showDate.toDateString()} ${booking.showTime}`);
    const hoursUntilShow = (showDateTime - new Date()) / (1000 * 60 * 60);

    if (hoursUntilShow < 2) {
      return res.status(400).json({ success: false, message: 'Cannot cancel within 2 hours of show' });
    }

    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled. Refund will be processed in 3-5 days.', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Cancellation failed' });
  }
});

module.exports = router;