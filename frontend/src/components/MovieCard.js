import React from 'react';

export default function MovieCard({ movie, onClick }) {
  const formatDuration = (min) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}h ${m}m`;
  };

  const genreColors = {
    'Action': '#e8372a', 'Drama': '#3b82f6', 'Sci-Fi': '#8b5cf6',
    'Comedy': '#f59e0b', 'Horror': '#6b7280', 'Romance': '#ec4899',
    'Thriller': '#f97316', 'Adventure': '#22c55e', 'Fantasy': '#a855f7',
    'Spy': '#06b6d4', 'Mythology': '#f5c842', 'Superhero': '#e8372a',
  };

  const genreColor = genreColors[movie.genre?.[0]] || '#8b8a96';
  const isComingSoon = movie.status === 'coming_soon';

  return (
    <div onClick={() => onClick(movie)} style={styles.card}>
      {/* Poster */}
      <div style={styles.posterWrap}>
        <img
          src={movie.poster || `https://picsum.photos/seed/${movie._id}/400/600`}
          alt={movie.title}
          style={styles.poster}
          loading="lazy"
        />
        {/* Overlay */}
        <div style={styles.overlay}>
          <button style={styles.bookBtn}>
            {isComingSoon ? '🔔 Notify Me' : '🎟️ Book Now'}
          </button>
        </div>
        {/* Badges */}
        <div style={styles.badges}>
          {isComingSoon && (
            <span style={{ ...styles.badge, background: 'rgba(245,200,66,0.9)', color: '#000' }}>
              COMING SOON
            </span>
          )}
          {movie.format && (
            <span style={{ ...styles.badge, background: 'rgba(232,55,42,0.9)' }}>
              IMAX
            </span>
          )}
        </div>
        {/* Rating */}
        <div style={styles.ratingBadge}>
          ⭐ {movie.rating?.toFixed(1)}
        </div>
      </div>

      {/* Info */}
      <div style={styles.info}>
        <h3 style={styles.title}>{movie.title}</h3>
        <div style={styles.meta}>
          <span style={{ ...styles.genre, color: genreColor, borderColor: genreColor + '40' }}>
            {movie.genre?.[0]}
          </span>
          <span style={styles.duration}>⏱ {formatDuration(movie.duration)}</span>
        </div>
        <div style={styles.langs}>
          {movie.language?.slice(0, 2).map(l => (
            <span key={l} style={styles.lang}>{l}</span>
          ))}
          {movie.language?.length > 2 && (
            <span style={styles.lang}>+{movie.language.length - 2}</span>
          )}
        </div>
        <div style={styles.showtimes}>
          {movie.showtimes?.slice(0, 3).map((s, i) => (
            <span key={i} style={styles.showtime}>{s.time}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#13131f',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 14,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  posterWrap: {
    position: 'relative',
    paddingBottom: '148%',
    background: '#0f0f1a',
    overflow: 'hidden',
  },
  poster: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: 12,
    opacity: 0,
    transition: 'opacity 0.25s ease',
  },
  bookBtn: {
    padding: '9px 18px',
    background: '#e8372a',
    border: 'none',
    borderRadius: 8,
    color: 'white',
    fontFamily: "'Outfit', sans-serif",
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    width: '100%',
  },
  badges: {
    position: 'absolute',
    top: 10,
    left: 10,
    display: 'flex',
    gap: 4,
    flexDirection: 'column',
  },
  badge: {
    padding: '3px 7px',
    borderRadius: 5,
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: 0.5,
    color: 'white',
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    background: 'rgba(0,0,0,0.8)',
    padding: '4px 8px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    color: '#f5c842',
  },
  info: { padding: '12px 14px' },
  title: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    color: '#f0eff5',
    marginBottom: 6,
    lineHeight: 1.3,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  meta: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' },
  genre: {
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 7px',
    borderRadius: 4,
    border: '1px solid',
  },
  duration: { fontSize: 11, color: '#8b8a96' },
  langs: { display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 },
  lang: {
    fontSize: 10,
    padding: '2px 6px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
    color: '#8b8a96',
  },
  showtimes: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  showtime: {
    fontSize: 11,
    padding: '3px 7px',
    background: 'rgba(232,55,42,0.1)',
    border: '1px solid rgba(232,55,42,0.2)',
    borderRadius: 5,
    color: '#e8372a',
    fontWeight: 500,
  },
};
