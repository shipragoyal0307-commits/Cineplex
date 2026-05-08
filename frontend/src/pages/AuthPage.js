import React, { useState } from 'react';

const API = 'http://localhost:5000';

const passwordRules = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Number (0-9)', test: (p) => /[0-9]/.test(p) },
  { label: 'Special character (!@#$%)', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

const usernameRules = [
  { label: '6–20 characters', test: (u) => u.length >= 6 && u.length <= 20 },
  { label: 'Letters, numbers, underscores only', test: (u) => /^[a-zA-Z0-9_]+$/.test(u) && u.length > 0 },
  { label: 'At least one letter', test: (u) => /[a-zA-Z]/.test(u) },
];

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusField, setFocusField] = useState('');
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirmPassword: '',
    fullName: '', phone: '', city: 'Mumbai'
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const getPasswordStrength = (p) => {
    const passed = passwordRules.filter(r => r.test(p)).length;
    if (passed <= 1) return { label: 'Very Weak', color: '#ef4444', width: '20%' };
    if (passed === 2) return { label: 'Weak', color: '#f97316', width: '40%' };
    if (passed === 3) return { label: 'Fair', color: '#f5c842', width: '60%' };
    if (passed === 4) return { label: 'Strong', color: '#22c55e', width: '80%' };
    return { label: 'Very Strong', color: '#10b981', width: '100%' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await fetch(`${API}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: form.username.trim(), password: form.password })
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('cineplex_token', data.token);
          localStorage.setItem('cineplex_user', JSON.stringify(data.user));
          window.location.href = '/dashboard';
        } else {
          setError(data.message || (data.errors && data.errors[0]?.msg) || 'Login failed');
        }
      } else {
        if (form.password !== form.confirmPassword) { setError('Passwords do not match'); setLoading(false); return; }
        if (form.username.trim().length < 6) { setError('Username must be at least 6 characters'); setLoading(false); return; }
        if (!passwordRules.every(r => r.test(form.password))) { setError('Password does not meet all requirements'); setLoading(false); return; }

        const res = await fetch(`${API}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: form.username.trim(), email: form.email.trim(),
            password: form.password, fullName: form.fullName.trim(),
            phone: form.phone.trim(), city: form.city
          })
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('cineplex_token', data.token);
          localStorage.setItem('cineplex_user', JSON.stringify(data.user));
          window.location.href = '/dashboard';
        } else {
          setError(data.message || (data.errors && data.errors[0]?.msg) || 'Registration failed');
        }
      }
    } catch (err) {
      setError('Cannot connect to server. Is backend running on port 5000? ' + err.message);
    }
    setLoading(false);
  };

  const strength = form.password ? getPasswordStrength(form.password) : null;

  return (
    <div style={styles.page}>
      <div style={styles.bgGradient} />
      <div style={styles.bgGrid} />
      <div style={styles.filmStrip}>{Array.from({ length: 20 }).map((_, i) => <div key={i} style={styles.filmHole} />)}</div>
      <div style={styles.container}>
        <div style={styles.logo}><span style={{ fontSize: 36 }}>🎬</span><span style={styles.logoText}>CINEPLEX</span></div>
        <p style={{ color: '#8b8a96', fontSize: 13, marginBottom: 12 }}>Your Ultimate Movie Experience</p>
        <div style={styles.card}>
          <div style={styles.tabs}>
            <button style={{ ...styles.tab, ...(mode === 'login' ? styles.tabActive : {}) }} onClick={() => { setMode('login'); setError(''); }}>Sign In</button>
            <button style={{ ...styles.tab, ...(mode === 'register' ? styles.tabActive : {}) }} onClick={() => { setMode('register'); setError(''); }}>Create Account</button>
          </div>
          <form onSubmit={handleSubmit} style={styles.form}>
            {mode === 'register' && (<>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <input name="fullName" placeholder="John Doe" value={form.fullName} onChange={handleChange} required style={styles.input} />
              </div>
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Phone</label>
                  <input name="phone" placeholder="9876543210" value={form.phone} onChange={handleChange} style={styles.input} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>City</label>
                  <select name="city" value={form.city} onChange={handleChange} style={styles.select}>
                    {['Mumbai','Delhi','Bengaluru','Chennai','Hyderabad','Kolkata','Pune','Ahmedabad'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required style={styles.input} />
              </div>
            </>)}

            <div style={styles.inputGroup}>
              <label style={styles.label}>{mode === 'login' ? 'Username or Email' : 'Username'}</label>
              <input name="username" placeholder={mode === 'login' ? 'Enter username or email' : 'cool_user21'}
                value={form.username} onChange={handleChange}
                onFocus={() => setFocusField('username')} onBlur={() => setFocusField('')}
                required style={styles.input} />
              {mode === 'register' && focusField === 'username' && form.username && (
                <div style={styles.hintBox}>{usernameRules.map(r => (
                  <div key={r.label} style={styles.hintRow}>
                    <span style={{ color: r.test(form.username) ? '#22c55e' : '#4a4956' }}>{r.test(form.username) ? '✓' : '○'}</span>
                    <span style={{ color: r.test(form.username) ? '#22c55e' : '#8b8a96', fontSize: 12 }}>{r.label}</span>
                  </div>
                ))}</div>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} name="password"
                  placeholder={mode === 'register' ? 'Create a strong password' : 'Enter password'}
                  value={form.password} onChange={handleChange}
                  onFocus={() => setFocusField('password')} onBlur={() => setFocusField('')}
                  required style={{ ...styles.input, paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>{showPassword ? '🙈' : '👁️'}</button>
              </div>
              {mode === 'register' && form.password && (<div style={{ marginTop: 8 }}>
                <div style={styles.strengthBar}><div style={{ ...styles.strengthFill, width: strength.width, background: strength.color }} /></div>
                <span style={{ fontSize: 11, color: strength.color }}>{strength.label}</span>
                {focusField === 'password' && (
                  <div style={styles.hintBox}>{passwordRules.map(r => (
                    <div key={r.label} style={styles.hintRow}>
                      <span style={{ color: r.test(form.password) ? '#22c55e' : '#4a4956' }}>{r.test(form.password) ? '✓' : '○'}</span>
                      <span style={{ color: r.test(form.password) ? '#22c55e' : '#8b8a96', fontSize: 12 }}>{r.label}</span>
                    </div>
                  ))}</div>
                )}
              </div>)}
            </div>

            {mode === 'register' && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                    placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} required
                    style={{ ...styles.input, paddingRight: 44, borderColor: form.confirmPassword && form.password !== form.confirmPassword ? '#ef4444' : undefined }} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>{showConfirm ? '🙈' : '👁️'}</button>
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>Passwords do not match</p>
                )}
              </div>
            )}

            {error && <div style={styles.errorBox}>⚠️ {error}</div>}

            <button type="submit" disabled={loading} style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}>
              {loading ? (mode === 'login' ? 'Signing In...' : 'Creating Account...') : (mode === 'login' ? '🎬 Sign In' : '🚀 Create Account')}
            </button>
          </form>
          <p style={{ textAlign: 'center', color: '#8b8a96', fontSize: 13, padding: '12px 28px 24px' }}>
            {mode === 'login' ? 'New here? ' : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              style={{ background: 'none', border: 'none', color: '#e8372a', cursor: 'pointer', fontSize: 13, fontWeight: 600, textDecoration: 'underline' }}>
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#080810', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', position: 'relative', overflow: 'hidden' },
  bgGradient: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(232,55,42,0.15) 0%, transparent 70%)', pointerEvents: 'none' },
  bgGrid: { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none' },
  filmStrip: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 30, background: '#0a0a12', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center', padding: '10px 0' },
  filmHole: { width: 12, height: 12, borderRadius: 2, background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' },
  container: { width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  logo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 },
  logoText: { fontFamily: 'Georgia, serif', fontSize: '3rem', color: '#f0eff5', letterSpacing: 4, fontWeight: 700 },
  card: { width: '100%', background: '#13131f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' },
  tabs: { display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  tab: { flex: 1, padding: '16px', background: 'none', border: 'none', color: '#8b8a96', fontFamily: 'system-ui, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  tabActive: { color: '#e8372a', borderBottom: '2px solid #e8372a', background: 'rgba(232,55,42,0.05)' },
  form: { padding: '28px 28px 20px', display: 'flex', flexDirection: 'column', gap: 16 },
  row: { display: 'flex', gap: 12 },
  inputGroup: { flex: 1, display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: '#8b8a96', letterSpacing: 0.5, textTransform: 'uppercase' },
  input: { width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#f0eff5', fontFamily: 'system-ui, sans-serif', fontSize: 14, outline: 'none' },
  select: { width: '100%', padding: '12px 14px', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#f0eff5', fontFamily: 'system-ui, sans-serif', fontSize: 14, outline: 'none' },
  eyeBtn: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 0 },
  strengthBar: { height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  strengthFill: { height: '100%', borderRadius: 2, transition: 'all 0.3s ease' },
  hintBox: { marginTop: 8, padding: '10px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 4 },
  hintRow: { display: 'flex', alignItems: 'center', gap: 8 },
  errorBox: { padding: '12px 14px', background: 'rgba(232,55,42,0.1)', border: '1px solid rgba(232,55,42,0.3)', borderRadius: 10, color: '#e8372a', fontSize: 13 },
  submitBtn: { width: '100%', padding: '14px', background: '#e8372a', border: 'none', borderRadius: 12, color: 'white', fontFamily: 'system-ui, sans-serif', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4 },
};
