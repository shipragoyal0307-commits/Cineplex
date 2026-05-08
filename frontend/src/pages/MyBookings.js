import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { bookingAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await bookingAPI.getMy();
      setBookings(data.bookings || []);
    } catch { setBookings([]); }
    setLoading(false);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await bookingAPI.cancel(id);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed');
    }
  };

  const filtered = bookings.filter(b => {
    if (filter === 'upcoming') return b.status === 'confirmed' && new Date(b.showDate) > new Date();
    if (filter === 'past') return b.status === 'completed' || new Date(b.showDate) < new Date();
    if (filter === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  const statusColors = { confirmed: '#22c55e', cancelled: '#e8372a', completed: '#8b8a96' };
  const statusIcons = { confirmed: '✅', cancelled: '❌', completed: '🎬' };

  return (
    <div style={{ background: '#080810', minHeight: '100vh' }}>
      <Navbar />
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>🎟️ My Bookings</h1>
          <p style={styles.sub}>View and manage all your movie tickets</p>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          {[
            { label: 'Total Bookings', value: bookings.length, icon: '🎬', color: '#e8372a' },
            { label: 'Upcoming', value: bookings.filter(b => b.status === 'confirmed' && new Date(b.showDate) > new Date()).length, icon: '📅', color: '#22c55e' },
            { label: 'Loyalty Points', value: user?.loyaltyPoints || 0, icon: '⭐', color: '#f5c842' },
          ].map(s => (
            <div key={s.label} style={{ ...styles.statCard, borderColor: s.color + '30' }}>
              <span style={{ fontSize: 28 }}>{s.icon}</span>
              <div>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', color: s.color, letterSpacing: 1 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: '#8b8a96' }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={styles.filterRow}>
          {['all', 'upcoming', 'past', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ ...styles.filterTab, ...(filter === f ? styles.filterTabActive : {}) }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={styles.spinner} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>
            <span style={{ fontSize: 64 }}>🎫</span>
            <p style={{ color: '#8b8a96', marginTop: 16, fontSize: 16 }}>No bookings found</p>
            <a href="/dashboard" style={styles.browseBtn}>Browse Movies</a>
          </div>
        ) : (
          <div style={styles.list}>
            {filtered.map(booking => {
              const isUpcoming = new Date(booking.showDate) > new Date() && booking.status === 'confirmed';
              return (
                <div key={booking._id} style={{ ...styles.bookingCard, borderColor: isUpcoming ? 'rgba(232,55,42,0.2)' : 'rgba(255,255,255,0.08)' }}>
                  {/* Left: Poster */}
                  <img
                    src={booking.moviePoster || `https://picsum.photos/seed/${booking._id}/200/300`}
                    alt={booking.movieTitle}
                    style={styles.poster}
                  />

                  {/* Center: Details */}
                  <div style={styles.details}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <h3 style={styles.movieTitle}>{booking.movieTitle}</h3>
                      <span style={{ ...styles.statusBadge, background: statusColors[booking.status] + '20', color: statusColors[booking.status], border: `1px solid ${statusColors[booking.status]}40` }}>
                        {statusIcons[booking.status]} {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    <div style={styles.infoGrid}>
                      <div style={styles.infoItem}><span style={styles.infoLabel}>📅 Date</span><span style={styles.infoVal}>{new Date(booking.showDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                      <div style={styles.infoItem}><span style={styles.infoLabel}>⏰ Time</span><span style={styles.infoVal}>{booking.showTime}</span></div>
                      <div style={styles.infoItem}><span style={styles.infoLabel}>🏟️ Theater</span><span style={styles.infoVal}>{booking.theater}</span></div>
                      <div style={styles.infoItem}><span style={styles.infoLabel}>🎭 Format</span><span style={styles.infoVal}>{booking.format}</span></div>
                      <div style={styles.infoItem}><span style={styles.infoLabel}>💺 Seats</span><span style={styles.infoVal}>{booking.seats?.join(', ')}</span></div>
                      <div style={styles.infoItem}><span style={styles.infoLabel}>💰 Paid</span><span style={{ ...styles.infoVal, color: '#22c55e', fontWeight: 700 }}>₹{booking.finalAmount}</span></div>
                    </div>
                    <div style={styles.bookingIdRow}>
                      <span style={{ color: '#4a4956', fontSize: 12 }}>Booking ID:</span>
                      <span style={{ color: '#e8372a', fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>{booking.bookingId}</span>
                    </div>
                  </div>

                  {/* Right: QR + actions */}
                  <div style={styles.rightPanel}>
                    {isUpcoming && (
                      <div style={styles.qrBox}>
                        <div style={styles.qrPlaceholder}>
                          {/* QR visual */}
                          {Array.from({ length: 5 }).map((_, r) => (
                            <div key={r} style={{ display: 'flex', gap: 3 }}>
                              {Array.from({ length: 5 }).map((_, c) => (
                                <div key={c} style={{ width: 8, height: 8, background: (r + c) % 2 === 0 ? '#f0eff5' : 'transparent' }} />
                              ))}
                            </div>
                          ))}
                        </div>
                        <p style={{ fontSize: 10, color: '#4a4956', marginTop: 6, textAlign: 'center' }}>Show QR at entry</p>
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {isUpcoming && (
                        <button onClick={() => handleCancel(booking._id)} style={styles.cancelBtn}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  main: { maxWidth: 1100, margin: '0 auto', padding: '40px 24px' },
  header: { marginBottom: 28 },
  title: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', letterSpacing: 2, color: '#f0eff5' },
  sub: { color: '#8b8a96', fontSize: 14 },
  statsRow: { display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '20px 24px',
    background: '#13131f',
    border: '1px solid',
    borderRadius: 14,
    flex: 1,
    minWidth: 180,
  },
  filterRow: { display: 'flex', gap: 8, marginBottom: 24 },
  filterTab: {
    padding: '8px 20px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    color: '#8b8a96',
    fontFamily: "'Outfit', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    textTransform: 'capitalize',
  },
  filterTabActive: { background: 'rgba(232,55,42,0.1)', border: '1px solid rgba(232,55,42,0.3)', color: '#e8372a' },
  spinner: {
    width: 40, height: 40,
    border: '3px solid rgba(255,255,255,0.08)',
    borderTop: '3px solid #e8372a',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  empty: { textAlign: 'center', padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  browseBtn: {
    marginTop: 16,
    padding: '12px 28px',
    background: '#e8372a',
    borderRadius: 10,
    color: 'white',
    textDecoration: 'none',
    fontWeight: 700,
    fontFamily: "'Outfit', sans-serif",
  },
  list: { display: 'flex', flexDirection: 'column', gap: 16 },
  bookingCard: {
    display: 'flex',
    gap: 20,
    background: '#13131f',
    border: '1px solid',
    borderRadius: 16,
    overflow: 'hidden',
    transition: 'all 0.2s',
    padding: 20,
    alignItems: 'flex-start',
  },
  poster: { width: 80, height: 120, objectFit: 'cover', borderRadius: 10, flexShrink: 0 },
  details: { flex: 1 },
  movieTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: 1, color: '#f0eff5' },
  statusBadge: {
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
  },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8, marginBottom: 10 },
  infoItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  infoLabel: { fontSize: 11, color: '#4a4956', fontWeight: 600 },
  infoVal: { fontSize: 13, color: '#f0eff5', fontWeight: 500 },
  bookingIdRow: { display: 'flex', gap: 8, alignItems: 'center' },
  rightPanel: { display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', flexShrink: 0 },
  qrBox: {
    padding: '12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  qrPlaceholder: { display: 'flex', flexDirection: 'column', gap: 3 },
  cancelBtn: {
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid rgba(232,55,42,0.4)',
    borderRadius: 8,
    color: '#e8372a',
    fontFamily: "'Outfit', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
