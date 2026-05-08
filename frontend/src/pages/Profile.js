import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../utils/api';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const [tab, setTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    city: user?.city || 'Mumbai',
    notifications: user?.notifications ?? true,
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  const cities = ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad'];

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      const { data } = await userAPI.updateProfile(form);
      if (data.success) {
        updateUser(data.user);
        setMsg({ type: 'success', text: 'Profile updated successfully!' });
        setEditing(false);
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    }
    setLoading(false);
  };

  const handlePasswordChange = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setMsg({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    const rules = [
      /[A-Z]/, /[a-z]/, /[0-9]/, /[!@#$%^&*(),.?":{}|<>]/
    ];
    if (pwForm.newPassword.length < 8 || !rules.every(r => r.test(pwForm.newPassword))) {
      setMsg({ type: 'error', text: 'New password does not meet strength requirements' });
      return;
    }
    setLoading(true);
    try {
      const { data } = await userAPI.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      if (data.success) {
        setMsg({ type: 'success', text: 'Password changed! Please login again.' });
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => logout(), 2000);
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    }
    setLoading(false);
  };

  const memberSince = user?.memberSince
    ? new Date(user.memberSince).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'N/A';

  return (
    <div style={{ background: '#080810', minHeight: '100vh' }}>
      <Navbar />
      <div style={styles.main}>
        {/* Profile Header */}
        <div style={styles.profileHero}>
          <div style={styles.avatarLarge}>
            {user?.fullName?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h1 style={styles.heroName}>{user?.fullName}</h1>
            <p style={styles.heroUsername}>@{user?.username}</p>
            <p style={{ color: '#8b8a96', fontSize: 13 }}>Member since {memberSince}</p>
            <div style={styles.heroBadges}>
              <span style={styles.roleBadge}>{user?.role === 'admin' ? '👑 Admin' : '🎬 Movie Lover'}</span>
              <span style={styles.cityBadge}>📍 {user?.city || 'Mumbai'}</span>
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <div style={styles.pointsLarge}>
              <span style={{ fontSize: 32 }}>⭐</span>
              <div>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#f5c842', letterSpacing: 1 }}>{user?.loyaltyPoints || 0}</p>
                <p style={{ fontSize: 12, color: '#8b8a96' }}>Loyalty Points</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alert message */}
        {msg.text && (
          <div style={{ ...styles.alert, ...(msg.type === 'success' ? styles.alertSuccess : styles.alertError) }}>
            {msg.type === 'success' ? '✅' : '⚠️'} {msg.text}
            <button onClick={() => setMsg({ type: '', text: '' })} style={styles.alertClose}>✕</button>
          </div>
        )}

        {/* Tabs */}
        <div style={styles.tabs}>
          {[
            { id: 'profile', label: '👤 Profile', },
            { id: 'security', label: '🔒 Security', },
            { id: 'preferences', label: '⚙️ Preferences', },
          ].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setMsg({ type: '', text: '' }); }}
              style={{ ...styles.tab, ...(tab === t.id ? styles.tabActive : {}) }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={styles.content}>
          {/* Profile Tab */}
          {tab === 'profile' && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Personal Information</h3>
                {!editing ? (
                  <button onClick={() => setEditing(true)} style={styles.editBtn}>✏️ Edit</button>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setEditing(false)} style={styles.cancelEditBtn}>Cancel</button>
                    <button onClick={handleProfileSave} disabled={loading} style={styles.saveBtn}>
                      {loading ? 'Saving...' : '💾 Save'}
                    </button>
                  </div>
                )}
              </div>
              <div style={styles.formGrid}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Full Name</label>
                  {editing ? (
                    <input style={styles.input} value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
                  ) : (
                    <p style={styles.fieldVal}>{user?.fullName}</p>
                  )}
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Username</label>
                  <p style={{ ...styles.fieldVal, color: '#8b8a96' }}>@{user?.username} <span style={{ fontSize: 11, color: '#4a4956' }}>(cannot change)</span></p>
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Email</label>
                  <p style={{ ...styles.fieldVal, color: '#8b8a96' }}>{user?.email} <span style={{ fontSize: 11, color: '#4a4956' }}>(cannot change)</span></p>
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Phone</label>
                  {editing ? (
                    <input style={styles.input} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile number" />
                  ) : (
                    <p style={styles.fieldVal}>{user?.phone || '—'}</p>
                  )}
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>City</label>
                  {editing ? (
                    <select style={styles.select} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}>
                      {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : (
                    <p style={styles.fieldVal}>{user?.city || 'Mumbai'}</p>
                  )}
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Member Since</label>
                  <p style={styles.fieldVal}>{memberSince}</p>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {tab === 'security' && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Change Password</h3>
              </div>
              <div style={{ maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { key: 'currentPassword', label: 'Current Password', show: showPw.current, toggle: () => setShowPw(s => ({ ...s, current: !s.current })) },
                  { key: 'newPassword', label: 'New Password', show: showPw.new, toggle: () => setShowPw(s => ({ ...s, new: !s.new })) },
                  { key: 'confirmPassword', label: 'Confirm New Password', show: showPw.confirm, toggle: () => setShowPw(s => ({ ...s, confirm: !s.confirm })) },
                ].map(f => (
                  <div key={f.key}>
                    <label style={styles.label}>{f.label}</label>
                    <div style={{ position: 'relative', marginTop: 6 }}>
                      <input
                        type={f.show ? 'text' : 'password'}
                        value={pwForm[f.key]}
                        onChange={e => setPwForm({ ...pwForm, [f.key]: e.target.value })}
                        style={{ ...styles.input, paddingRight: 44 }}
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={f.toggle} style={styles.eyeBtn}>{f.show ? '🙈' : '👁️'}</button>
                    </div>
                  </div>
                ))}

                <div style={styles.pwRequirements}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#4a4956', marginBottom: 8 }}>NEW PASSWORD MUST HAVE:</p>
                  {[
                    { label: '8+ characters', test: p => p.length >= 8 },
                    { label: 'Uppercase letter', test: p => /[A-Z]/.test(p) },
                    { label: 'Lowercase letter', test: p => /[a-z]/.test(p) },
                    { label: 'Number', test: p => /[0-9]/.test(p) },
                    { label: 'Special character', test: p => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ color: r.test(pwForm.newPassword) ? '#22c55e' : '#4a4956', fontSize: 12 }}>
                        {r.test(pwForm.newPassword) ? '✓' : '○'}
                      </span>
                      <span style={{ fontSize: 12, color: r.test(pwForm.newPassword) ? '#22c55e' : '#8b8a96' }}>{r.label}</span>
                    </div>
                  ))}
                </div>

                <button onClick={handlePasswordChange} disabled={loading} style={styles.saveBtn}>
                  {loading ? 'Changing...' : '🔒 Change Password'}
                </button>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {tab === 'preferences' && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Preferences</h3>
                <button onClick={handleProfileSave} disabled={loading} style={styles.saveBtn}>
                  {loading ? 'Saving...' : '💾 Save'}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={styles.preferenceRow}>
                  <div>
                    <p style={{ fontWeight: 600, color: '#f0eff5' }}>Email Notifications</p>
                    <p style={{ fontSize: 13, color: '#8b8a96' }}>Get updates about bookings and offers</p>
                  </div>
                  <div
                    onClick={() => setForm(f => ({ ...f, notifications: !f.notifications }))}
                    style={{ ...styles.toggle, background: form.notifications ? '#e8372a' : 'rgba(255,255,255,0.1)' }}
                  >
                    <div style={{ ...styles.toggleDot, transform: form.notifications ? 'translateX(22px)' : 'translateX(2px)' }} />
                  </div>
                </div>
                <div style={styles.preferenceRow}>
                  <div>
                    <p style={{ fontWeight: 600, color: '#f0eff5' }}>Default City</p>
                    <p style={{ fontSize: 13, color: '#8b8a96' }}>Movies will show for this city by default</p>
                  </div>
                  <select style={{ ...styles.select, width: 160 }} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  main: { maxWidth: 1000, margin: '0 auto', padding: '40px 24px' },
  profileHero: {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    background: 'linear-gradient(135deg, rgba(232,55,42,0.08) 0%, rgba(255,107,53,0.04) 100%)',
    border: '1px solid rgba(232,55,42,0.15)',
    borderRadius: 20,
    padding: '28px 32px',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  avatarLarge: {
    width: 80, height: 80,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #e8372a, #ff6b35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '2.4rem',
    color: 'white',
    flexShrink: 0,
    boxShadow: '0 8px 24px rgba(232,55,42,0.4)',
  },
  heroName: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#f0eff5', letterSpacing: 1 },
  heroUsername: { color: '#e8372a', fontSize: 14, fontWeight: 600, marginBottom: 4 },
  heroBadges: { display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  roleBadge: { padding: '4px 12px', background: 'rgba(232,55,42,0.15)', border: '1px solid rgba(232,55,42,0.3)', borderRadius: 20, fontSize: 12, color: '#e8372a', fontWeight: 600 },
  cityBadge: { padding: '4px 12px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 20, fontSize: 12, color: '#3b82f6', fontWeight: 600 },
  pointsLarge: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.2)',
    borderRadius: 14, padding: '16px 20px',
  },
  alert: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '14px 18px', borderRadius: 12,
    marginBottom: 20, fontSize: 14,
    justifyContent: 'space-between',
  },
  alertSuccess: { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' },
  alertError: { background: 'rgba(232,55,42,0.1)', border: '1px solid rgba(232,55,42,0.3)', color: '#e8372a' },
  alertClose: { background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 14 },
  tabs: { display: 'flex', gap: 4, marginBottom: 20 },
  tab: {
    padding: '10px 22px', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
    color: '#8b8a96', fontFamily: "'Outfit', sans-serif",
    fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
  },
  tabActive: { background: 'rgba(232,55,42,0.1)', border: '1px solid rgba(232,55,42,0.3)', color: '#e8372a' },
  content: {},
  card: {
    background: '#13131f',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: '28px',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  cardTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', letterSpacing: 1, color: '#f0eff5' },
  editBtn: {
    padding: '8px 18px', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
    color: '#f0eff5', fontFamily: "'Outfit', sans-serif",
    fontSize: 13, cursor: 'pointer',
  },
  cancelEditBtn: {
    padding: '8px 16px', background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
    color: '#8b8a96', fontFamily: "'Outfit', sans-serif",
    fontSize: 13, cursor: 'pointer',
  },
  saveBtn: {
    padding: '10px 22px', background: '#e8372a',
    border: 'none', borderRadius: 8,
    color: 'white', fontFamily: "'Outfit', sans-serif",
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
  },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, fontWeight: 700, color: '#4a4956', letterSpacing: 0.5, textTransform: 'uppercase' },
  fieldVal: { fontSize: 15, color: '#f0eff5', fontWeight: 500, padding: '10px 0' },
  input: {
    width: '100%', padding: '11px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 9, color: '#f0eff5',
    fontFamily: "'Outfit', sans-serif", fontSize: 14, outline: 'none',
  },
  select: {
    width: '100%', padding: '11px 14px',
    background: '#1a1a2e',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 9, color: '#f0eff5',
    fontFamily: "'Outfit', sans-serif", fontSize: 14, outline: 'none',
  },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', fontSize: 16,
  },
  pwRequirements: {
    padding: '14px 16px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 10,
  },
  preferenceRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 0',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  toggle: {
    width: 46, height: 26, borderRadius: 13,
    position: 'relative', cursor: 'pointer',
    transition: 'background 0.3s', flexShrink: 0,
  },
  toggleDot: {
    position: 'absolute', top: 3,
    width: 20, height: 20,
    borderRadius: '50%', background: 'white',
    transition: 'transform 0.3s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
};
