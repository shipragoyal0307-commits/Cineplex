import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import BookingModal from '../components/BookingModal';
import { movieAPI } from '../utils/api';

const FEATURED = [
  { title: 'Dune: Part Three', subtitle: 'The Final Chapter of an Epic Saga', bg: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 100%)', accent: '#8b5cf6', emoji: '🏜️' },
  { title: 'Mission Impossible', subtitle: 'Final Reckoning — In Theaters Now', bg: 'linear-gradient(135deg, #1a0a0a 0%, #3d0f0f 100%)', accent: '#e8372a', emoji: '💣' },
  { title: 'Avatar 3', subtitle: 'Experience Pandora in IMAX 3D', bg: 'linear-gradient(135deg, #0a1a1a 0%, #0f3d3d 100%)', accent: '#22c55e', emoji: '🌿' },
];

const STATS = [
  { label: 'Movies Now Showing', value: '48', icon: '🎬' },
  { label: 'Partner Theaters', value: '200+', icon: '🏟️' },
  { label: 'Cities', value: '50+', icon: '🌆' },
  { label: 'Happy Customers', value: '2M+', icon: '😊' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState(user?.city || 'Mumbai');
  const [filter, setFilter] = useState({ genre: '', language: '', format: '' });
  const [activeStatus, setActiveStatus] = useState('now_showing');
  const [heroIdx, setHeroIdx] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, [activeStatus, filter, search]);

  useEffect(() => {
    const timer = setInterval(() => setHeroIdx(i => (i + 1) % FEATURED.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const { data } = await movieAPI.getAll({
        status: activeStatus,
        genre: filter.genre,
        language: filter.language,
        search,
      });
      setMovies(data.movies || []);
    } catch {
      setMovies([]);
    }
    setLoading(false);
  };

  const GENRES = ['Action', 'Drama', 'Sci-Fi', 'Comedy', 'Thriller', 'Adventure', 'Horror', 'Mythology'];
  const LANGS = ['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam'];

  const hero = FEATURED[heroIdx];

  return (
    <div style={{ background: '#080810', minHeight: '100vh' }}>
      <Navbar onSearch={setSearch} city={city} setCity={setCity} />

      {/* Hero Banner */}
      <div style={{ ...styles.hero, background: hero.bg }}>
        <div style={styles.heroBg} />
        <div style={styles.heroContent}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 48 }}>{hero.emoji}</span>
            <span style={{ ...styles.heroBadge, background: hero.accent + '30', color: hero.accent, border: `1px solid ${hero.accent}50` }}>
              NOW SHOWING
            </span>
          </div>
          <h1 style={{ ...styles.heroTitle, color: '#f0eff5' }}>
            {hero.title}
          </h1>
          <p style={styles.heroSub}>{hero.subtitle}</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setSelectedMovie(movies[0])} style={{ ...styles.heroBtnPrimary, background: hero.accent }}>
              🎟️ Book Tickets
            </button>
            <button style={styles.heroBtnOutline}>▶ Watch Trailer</button>
          </div>
        </div>
        {/* Hero dots */}
        <div style={styles.heroDots}>
          {FEATURED.map((_, i) => (
            <button key={i} onClick={() => setHeroIdx(i)} style={{ ...styles.heroDot, opacity: i === heroIdx ? 1 : 0.3, background: hero.accent }} />
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div style={styles.statsBar}>
        {STATS.map(s => (
          <div key={s.label} style={styles.statItem}>
            <span style={{ fontSize: 22 }}>{s.icon}</span>
            <div>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: '#f0eff5', letterSpacing: 1 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: '#8b8a96' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.main}>
        {/* Welcome banner */}
        <div style={styles.welcomeBanner}>
          <div>
            <p style={{ color: '#8b8a96', fontSize: 13 }}>Welcome back,</p>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', letterSpacing: 1, color: '#f0eff5' }}>
              {user?.fullName?.toUpperCase()} 👋
            </h2>
          </div>
          <div style={styles.welcomeRight}>
            <div style={styles.pointsCard}>
              <span style={{ fontSize: 20 }}>⭐</span>
              <div>
                <p style={{ fontWeight: 700, color: '#f5c842', fontSize: 18 }}>{user?.loyaltyPoints || 0}</p>
                <p style={{ fontSize: 11, color: '#8b8a96' }}>Loyalty Points</p>
              </div>
            </div>
            <button onClick={() => navigate('/bookings')} style={styles.myTicketsBtn}>
              🎟️ My Tickets
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {['now_showing', 'coming_soon'].map(s => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              style={{ ...styles.tab, ...(activeStatus === s ? styles.tabActive : {}) }}
            >
              {s === 'now_showing' ? '🎬 Now Showing' : '📅 Coming Soon'}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <div style={styles.filterRow}>
            <span style={styles.filterLabel}>Genre:</span>
            <div style={styles.filterBtns}>
              <button style={{ ...styles.filterBtn, ...(filter.genre === '' ? styles.filterBtnActive : {}) }} onClick={() => setFilter(f => ({ ...f, genre: '' }))}>All</button>
              {GENRES.map(g => (
                <button key={g} style={{ ...styles.filterBtn, ...(filter.genre === g ? styles.filterBtnActive : {}) }} onClick={() => setFilter(f => ({ ...f, genre: g === f.genre ? '' : g }))}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div style={styles.filterRow}>
            <span style={styles.filterLabel}>Language:</span>
            <div style={styles.filterBtns}>
              <button style={{ ...styles.filterBtn, ...(filter.language === '' ? styles.filterBtnActive : {}) }} onClick={() => setFilter(f => ({ ...f, language: '' }))}>All</button>
              {LANGS.map(l => (
                <button key={l} style={{ ...styles.filterBtn, ...(filter.language === l ? styles.filterBtnActive : {}) }} onClick={() => setFilter(f => ({ ...f, language: l === f.language ? '' : l }))}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Movies grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 14, overflow: 'hidden', background: '#13131f' }}>
                <div style={{ paddingBottom: '148%', background: 'linear-gradient(90deg, #13131f 25%, #1a1a2e 50%, #13131f 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                <div style={{ padding: 14 }}>
                  <div style={{ height: 16, borderRadius: 4, background: '#1a1a2e', marginBottom: 8 }} />
                  <div style={{ height: 12, borderRadius: 4, background: '#1a1a2e', width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div style={styles.empty}>
            <span style={{ fontSize: 48 }}>🎬</span>
            <p style={{ color: '#8b8a96', marginTop: 12 }}>No movies found. Try different filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
            {movies.map(movie => (
              <MovieCard key={movie._id} movie={movie} onClick={setSelectedMovie} />
            ))}
          </div>
        )}

        {/* Offers section */}
        <div style={{ marginTop: 48 }}>
          <h2 style={styles.sectionTitle}>🎁 Offers & Deals</h2>
          <div style={styles.offersGrid}>
            {[
              { code: 'FIRST50', title: '₹50 Off', desc: 'First booking discount', color: '#e8372a', icon: '🎉' },
              { code: 'MOVIE100', title: '₹100 Off', desc: 'On bookings above ₹500', color: '#3b82f6', icon: '💙' },
              { code: 'IMAX150', title: '₹150 Off', desc: 'On IMAX screenings', color: '#8b5cf6', icon: '🎬' },
            ].map(offer => (
              <div key={offer.code} style={{ ...styles.offerCard, borderColor: offer.color + '30' }}>
                <span style={{ fontSize: 32 }}>{offer.icon}</span>
                <div>
                  <p style={{ fontWeight: 700, color: offer.color, fontSize: 18 }}>{offer.title}</p>
                  <p style={{ fontSize: 13, color: '#8b8a96' }}>{offer.desc}</p>
                  <span style={{ display: 'inline-block', marginTop: 6, padding: '3px 10px', background: offer.color + '20', color: offer.color, borderRadius: 5, fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
                    {offer.code}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking modal */}
      {selectedMovie && (
        <BookingModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onSuccess={() => { setSelectedMovie(null); fetchMovies(); }}
        />
      )}
    </div>
  );
}

const styles = {
  hero: {
    position: 'relative',
    minHeight: 380,
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    padding: '60px 80px',
  },
  heroBg: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.03) 0%, transparent 60%)',
  },
  heroContent: { position: 'relative', zIndex: 1, maxWidth: 600 },
  heroBadge: {
    padding: '5px 14px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 2,
  },
  heroTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '3.5rem',
    letterSpacing: 2,
    lineHeight: 1.1,
    marginBottom: 12,
  },
  heroSub: { color: '#8b8a96', fontSize: 15, marginBottom: 28, maxWidth: 400 },
  heroBtnPrimary: {
    padding: '12px 28px',
    border: 'none',
    borderRadius: 12,
    color: 'white',
    fontFamily: "'Outfit', sans-serif",
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  heroBtnOutline: {
    padding: '12px 24px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 12,
    color: '#f0eff5',
    fontFamily: "'Outfit', sans-serif",
    fontSize: 15,
    cursor: 'pointer',
  },
  heroDots: {
    position: 'absolute',
    bottom: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 8,
  },
  heroDot: {
    width: 8, height: 8,
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.3s',
  },
  statsBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: 0,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.02)',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '20px 40px',
    borderRight: '1px solid rgba(255,255,255,0.06)',
  },
  main: { maxWidth: 1400, margin: '0 auto', padding: '40px 24px' },
  welcomeBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'linear-gradient(135deg, rgba(232,55,42,0.1) 0%, rgba(255,107,53,0.05) 100%)',
    border: '1px solid rgba(232,55,42,0.2)',
    borderRadius: 16,
    padding: '20px 28px',
    marginBottom: 32,
  },
  welcomeRight: { display: 'flex', alignItems: 'center', gap: 16 },
  pointsCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'rgba(245,200,66,0.1)',
    border: '1px solid rgba(245,200,66,0.2)',
    borderRadius: 12,
    padding: '10px 16px',
  },
  myTicketsBtn: {
    padding: '10px 20px',
    background: '#e8372a',
    border: 'none',
    borderRadius: 10,
    color: 'white',
    fontFamily: "'Outfit', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  },
  tabs: { display: 'flex', gap: 4, marginBottom: 20 },
  tab: {
    padding: '10px 24px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    color: '#8b8a96',
    fontFamily: "'Outfit', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabActive: { background: 'rgba(232,55,42,0.15)', border: '1px solid rgba(232,55,42,0.4)', color: '#e8372a' },
  filters: { marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 10 },
  filterRow: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  filterLabel: { fontSize: 12, fontWeight: 700, color: '#4a4956', letterSpacing: 0.5, minWidth: 70 },
  filterBtns: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  filterBtn: {
    padding: '5px 14px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    color: '#8b8a96',
    fontFamily: "'Outfit', sans-serif",
    fontSize: 12,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  filterBtnActive: { background: 'rgba(232,55,42,0.15)', border: '1px solid rgba(232,55,42,0.4)', color: '#e8372a' },
  sectionTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', letterSpacing: 1, color: '#f0eff5', marginBottom: 16 },
  offersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 },
  offerCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '20px',
    background: '#13131f',
    border: '1px solid',
    borderRadius: 14,
    transition: 'all 0.2s',
  },
  empty: {
    textAlign: 'center',
    padding: '60px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
};
