const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  theater: String,
  time: String,
  format: { type: String, enum: ['2D', '3D', 'IMAX', '4DX'], default: '2D' },
  price: { type: Number, default: 250 },
  availableSeats: { type: Number, default: 150 }
});

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  genre: [String],
  language: [{ type: String, default: 'English' }],
  duration: { type: Number, required: true }, // in minutes
  rating: { type: Number, min: 0, max: 10, default: 7 },
  ageRating: { type: String, enum: ['U', 'UA', 'A', 'S'], default: 'UA' },
  releaseDate: { type: Date, required: true },
  status: { type: String, enum: ['now_showing', 'coming_soon', 'ended'], default: 'now_showing' },
  poster: { type: String, default: '' },
  banner: { type: String, default: '' },
  trailer: { type: String, default: '' },
  cast: [String],
  director: String,
  showtimes: [showtimeSchema],
  totalBookings: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);