const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  movieTitle: String,
  moviePoster: String,
  theater: { type: String, required: true },
  showDate: { type: Date, required: true },
  showTime: { type: String, required: true },
  format: { type: String, enum: ['2D', '3D', 'IMAX', '4DX'], default: '2D' },
  seats: [String],
  totalAmount: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  couponUsed: { type: String, default: '' },
  foodOrders: [{
    item: String,
    quantity: Number,
    price: Number
  }],
  bookingId: { type: String, unique: true },
  status: { type: String, enum: ['confirmed', 'cancelled', 'completed'], default: 'confirmed' },
  paymentMethod: { type: String, default: 'card' },
  paymentStatus: { type: String, enum: ['paid', 'pending', 'refunded'], default: 'paid' }
}, { timestamps: true });

// Generate unique booking ID before saving
bookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    this.bookingId = 'CPX' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);