import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onSearch, city, setCity }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const dropRef = useRef(null);

  const cities = ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune'];

  useEffect(() => {
    const handleClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchVal);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', path: '/dashboard' },
    { label: 'Movies', path: '/movies' },
    { label: 'My Bookings', path: '/bookings' },
    { label: 'Offers', path: '/offers' },
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <button onClick={() => navigate('/dashboard')} style={styles.logo}>
          <span style={styles.logoIcon}>🎬</span>
          <span style={styles.logoText}>CINEPLEX</span>
        </button>

        {/* Nav links */}
        <div style={styles.links}>
          {navLinks.map(l => (
            <button
              key={l.path}
              onClick={() => navigate(l.path)}
              style={{
                ...styles.link,
                ...(location.pathname === l.path ? styles.linkActive : {})
              }}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            value={searchVal}
            onChange={e => { setSearchVal(e.target.value); if (onSearch) onSearch(e.target.value); }}
            placeholder="Search movies..."
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchBtn}>🔍</button>
        </form>

        {/* City selector */}
        <select
          value={city}
          onChange={e => setCity && setCity(e.target.value)}
          style={styles.citySelect}
        >
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* User */}
        <div style={{ position: 'relative' }} ref={dropRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={styles.userBtn}
          >
            <div style={styles.avatar}>
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{user?.username}</span>
              <span style={styles.userPoints}>⭐ {user?.loyaltyPoints || 0} pts</span>
            </div>
            <span style={{ color: '#8b8a96', fontSize: 10 }}>▼</span>
          </button>

          {showDropdown && (
            <div style={styles.dropdown}>
              <div style={styles.dropHeader}>
                <p style={{ fontWeight: 600, color: '#f0eff5' }}>{user?.fullName}</p>
                <p style={{ fontSize: 12, color: '#8b8a96' }}>{user?.email}</p>
              </div>
              <div style={styles.dropItems}>
                {[
                  { icon: '👤', label: 'Profile', path: '/profile' },
                  { icon: '🎟️', label: 'My Bookings', path: '/bookings' },
                  { icon: '🎁', label: 'Offers & Rewards', path: '/offers' },
                ].map(item => (
                  <button key={item.path} onClick={() => { navigate(item.path); setShowDropdown(false); }} style={styles.dropItem}>
                    <span>{item.icon}</span> {item.label}
                  </button>
                ))}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 4 }}>
                  <button onClick={handleLogout} style={{ ...styles.dropItem, color: '#e8372a' }}>
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(8,8,16,0.9)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  inner: {
    maxWidth: 1400,
    margin: '0 auto',
    padding: '0 24px',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 20,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    flexShrink: 0,
  },
  logoIcon: { fontSize: 22 },
  logoText: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '1.6rem',
    color: '#f0eff5',
    letterSpacing: 2,
  },
  links: { display: 'flex', gap: 4, flexShrink: 0 },
  link: {
    padding: '6px 14px',
    background: 'none',
    border: 'none',
    color: '#8b8a96',
    fontFamily: "'Outfit', sans-serif",
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    borderRadius: 8,
    transition: 'all 0.2s',
  },
  linkActive: { color: '#e8372a', background: 'rgba(232,55,42,0.1)' },
  searchForm: {
    flex: 1,
    display: 'flex',
    gap: 0,
    maxWidth: 280,
  },
  searchInput: {
    flex: 1,
    padding: '7px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRight: 'none',
    borderRadius: '8px 0 0 8px',
    color: '#f0eff5',
    fontFamily: "'Outfit', sans-serif",
    fontSize: 13,
    outline: 'none',
  },
  searchBtn: {
    padding: '7px 12px',
    background: '#e8372a',
    border: 'none',
    borderRadius: '0 8px 8px 0',
    cursor: 'pointer',
    fontSize: 14,
  },
  citySelect: {
    padding: '7px 10px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    color: '#f0eff5',
    fontFamily: "'Outfit', sans-serif",
    fontSize: 13,
    outline: 'none',
    flexShrink: 0,
  },
  userBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: '6px 12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  avatar: {
    width: 30, height: 30,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #e8372a, #ff6b35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontWeight: 700, fontSize: 13,
  },
  userInfo: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
  userName: { color: '#f0eff5', fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600 },
  userPoints: { color: '#f5c842', fontFamily: "'Outfit', sans-serif", fontSize: 10 },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    right: 0,
    background: '#1a1a2e',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    minWidth: 220,
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
    overflow: 'hidden',
    animation: 'fadeUp 0.2s ease',
  },
  dropHeader: {
    padding: '14px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  dropItems: { padding: '6px' },
  dropItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    background: 'none',
    border: 'none',
    color: '#8b8a96',
    fontFamily: "'Outfit', sans-serif",
    fontSize: 14,
    cursor: 'pointer',
    borderRadius: 8,
    textAlign: 'left',
    transition: 'all 0.15s',
  },
};
