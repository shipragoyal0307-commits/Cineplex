const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const { protect } = require('../middleware/auth');

// Seed sample movies if DB is empty
const seedMovies = async () => {
  const count = await Movie.countDocuments();
  if (count === 0) {
    await Movie.insertMany([
      {
        title: 'Dune: Part Three',
        description: 'Paul Atreides continues his journey as the messiah of the Fremen in the final chapter of the epic saga.',
        genre: ['Sci-Fi', 'Adventure', 'Drama'],
        language: ['English', 'Hindi'],
        duration: 165,
        rating: 9.1,
        ageRating: 'UA',
        releaseDate: new Date('2025-11-14'),
        status: 'now_showing',
        poster: 'https://picsum.photos/seed/dune3/400/600',
        director: 'Denis Villeneuve',
        cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson'],
        showtimes: [
          { theater: 'PVR Cinemas IMAX', time: '10:00 AM', format: 'IMAX', price: 550 },
          { theater: 'INOX Multiplex', time: '1:30 PM', format: '3D', price: 350 },
          { theater: 'Cinepolis', time: '4:00 PM', format: '2D', price: 250 },
          { theater: 'PVR Cinemas IMAX', time: '7:30 PM', format: 'IMAX', price: 550 }
        ]
      },
      {
        title: 'Avatar 3: The Seed Bearer',
        description: 'Jake Sully faces a new threat as the conflict between the Na\'vi and humans reaches a breaking point.',
        genre: ['Action', 'Sci-Fi', 'Fantasy'],
        language: ['English', 'Hindi', 'Tamil'],
        duration: 190,
        rating: 8.7,
        ageRating: 'UA',
        releaseDate: new Date('2025-12-19'),
        status: 'now_showing',
        poster: 'https://picsum.photos/seed/avatar3/400/600',
        director: 'James Cameron',
        cast: ['Sam Worthington', 'Zoe Saldaña', 'Sigourney Weaver'],
        showtimes: [
          { theater: 'PVR Cinemas IMAX', time: '9:30 AM', format: 'IMAX', price: 600 },
          { theater: 'INOX Multiplex', time: '12:00 PM', format: '3D', price: 380 },
          { theater: 'Cinepolis', time: '3:30 PM', format: '4DX', price: 700 },
          { theater: 'INOX Multiplex', time: '7:00 PM', format: '3D', price: 380 }
        ]
      },
      {
        title: 'Mission Impossible: Final Reckoning',
        description: 'Ethan Hunt embarks on his most dangerous and personal mission yet in this explosive franchise finale.',
        genre: ['Action', 'Thriller', 'Spy'],
        language: ['English', 'Hindi'],
        duration: 148,
        rating: 8.9,
        ageRating: 'UA',
        releaseDate: new Date('2025-05-23'),
        status: 'now_showing',
        poster: 'https://picsum.photos/seed/mi8/400/600',
        director: 'Christopher McQuarrie',
        cast: ['Tom Cruise', 'Hayley Atwell', 'Simon Pegg'],
        showtimes: [
          { theater: 'INOX Multiplex', time: '10:30 AM', format: '2D', price: 280 },
          { theater: 'Cinepolis', time: '1:00 PM', format: '3D', price: 350 },
          { theater: 'PVR Cinemas IMAX', time: '4:30 PM', format: 'IMAX', price: 520 },
          { theater: 'Cinepolis', time: '8:00 PM', format: '2D', price: 280 }
        ]
      },
      {
        title: 'Kalki 2898 - Part 2',
        description: 'The divine warrior Kalki rises to fulfill the ancient prophecy and save humanity from eternal darkness.',
        genre: ['Action', 'Mythology', 'Sci-Fi'],
        language: ['Telugu', 'Hindi', 'Tamil', 'Malayalam'],
        duration: 175,
        rating: 9.3,
        ageRating: 'UA',
        releaseDate: new Date('2026-01-12'),
        status: 'now_showing',
        poster: 'https://picsum.photos/seed/kalki2/400/600',
        director: 'Nag Ashwin',
        cast: ['Prabhas', 'Deepika Padukone', 'Amitabh Bachchan'],
        showtimes: [
          { theater: 'PVR Cinemas IMAX', time: '9:00 AM', format: 'IMAX', price: 580 },
          { theater: 'INOX Multiplex', time: '12:30 PM', format: '3D', price: 360 },
          { theater: 'Cinepolis', time: '4:00 PM', format: '2D', price: 260 },
          { theater: 'PVR Cinemas IMAX', time: '7:30 PM', format: 'IMAX', price: 580 }
        ]
      },
      {
        title: 'The Dark Knight Returns',
        description: 'An aging Bruce Wayne returns from retirement to face a new generation of crime terrorizing Gotham.',
        genre: ['Action', 'Superhero', 'Drama'],
        language: ['English', 'Hindi'],
        duration: 158,
        rating: 9.5,
        ageRating: 'UA',
        releaseDate: new Date('2026-06-15'),
        status: 'coming_soon',
        poster: 'https://picsum.photos/seed/batman/400/600',
        director: 'Matt Reeves',
        cast: ['Robert Pattinson', 'Zoë Kravitz', 'Paul Dano'],
        showtimes: []
      },
      {
        title: 'Inception 2',
        description: 'Dom Cobb returns to the dream world for one final heist that blurs the line between reality and illusion.',
        genre: ['Sci-Fi', 'Thriller', 'Action'],
        language: ['English', 'Hindi'],
        duration: 170,
        rating: 9.2,
        ageRating: 'UA',
        releaseDate: new Date('2026-07-22'),
        status: 'coming_soon',
        poster: 'https://picsum.photos/seed/inception2/400/600',
        director: 'Christopher Nolan',
        cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Tom Hardy'],
        showtimes: []
      }
    ]);
    console.log('🎬 Sample movies seeded');
  }
};

// Auto-seed on route load
seedMovies();

// GET /api/movies - Get all movies
router.get('/', async (req, res) => {
  try {
    const { status, genre, language, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (genre) query.genre = { $in: [genre] };
    if (language) query.language = { $in: [language] };
    if (search) query.title = { $regex: search, $options: 'i' };

    const movies = await Movie.find(query).sort({ releaseDate: -1 });
    res.json({ success: true, count: movies.length, movies });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching movies' });
  }
});

// GET /api/movies/:id
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    res.json({ success: true, movie });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching movie' });
  }
});

module.exports = router;