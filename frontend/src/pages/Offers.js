import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const OFFERS = [
  { code: 'FIRST50', title: '₹50 Off on First Booking', desc: 'Use this code on your very first movie booking at CinePlex.', discount: 50, validTill: '31 Dec 2026', color: '#e8372a', icon: '🎉', category: 'New User' },
  { code: 'MOVIE100', title: '₹100 Off on ₹500+', desc: 'Get ₹100 off on bookings worth ₹500 or more. No restrictions.', discount: 100, validTill: '30 Jun 2026', color: '#3b82f6', icon: '🎬', category: 'All Users' },
  { code: 'IMAX150', title: '₹150 Off on IMAX', desc: 'Exclusive discount on IMAX format screenings.', discount: 150, validTill: '31 Aug 2026', color: '#8b5cf6', icon: '📽️', category: 'IMAX' },
  { code: 'WEEKEND20', title: '20% Off on Weekends', desc: 'Enjoy 20% discount on Saturday & Sunday shows.', discount: '20%', validTill: 'Every weekend', color: '#f59e0b', icon: '🌟', category: 'Weekend' },
  { code: 'HDFC200', title: '₹200 Off with HDFC Card', desc: 'Get ₹200 instant discount when you pay with HDFC credit card.', discount: 200, validTill: '31 Mar 2026', color: '#22c55e', icon: '💳', category: 'Bank Offer' },
  { code: 'STUDENT30', title: '30% Off for Students', desc: 'Valid student ID required. Up to 30% off on any show.', discount: '30%', validTill: '31 Dec 2026', color: '#ec4899', icon: '🎓', category: 'Student' },
];

const LOYALTY_TIERS = [
  { name: 'Bronze', min: 0, max: 499, color: '#cd7f32', icon: '🥉', perks: ['Early access to tickets', '5% bonus points'] },
  { name: 'Silver', min: 500, max: 1999, color: '#8b8a96', icon: '🥈', perks: ['Priority booking', '10% bonus points', 'Free upgrade once/month'] },
  { name: 'Gold', min: 2000, max: 4999, color: '#f5c842', icon: '🥇', perks: ['Lounge access', '15% bonus points', 'Free popcorn/month', 'Priority support'] },
  { name: 'Platinum', min: 5000, max: Infinity, color: '#e0e7ff', icon: '💎', perks: ['VIP access', '25% bonus points', 'Free seat upgrade', 'Exclusive screenings'] },
];

export default function Offers() {
  const { user } = useAuth();
  const [copied, setCopied] = useState('');
  const [category, setCategory] = useState('All');

  const copyCode = (code) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(''), 2000);
  };

  const points = user?.loyaltyPoints || 0;
  const currentTier = LOYALTY_TIERS.find(t => points >= t.min && points <= t.max) || LOYALTY_TIERS[0];
  const nextTier = LOYALTY_TIERS[LOYALTY_TIERS.indexOf(currentTier) + 1];
  const progress = nextTier ? ((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100 : 100;

  const categories = ['All', ...new Set(OFFERS.map(o => o.category))];
  const filtered = category === 'All' ? OFFERS : OFFERS.filter(o => o.category === category);

  return (
    <div style={{ background: '#080810', minHeight: '100vh' }}>
      <Navbar />
      <div style={styles.main}>
        <h1 style={styles.pageTitle}>🎁 Offers & Rewards</h1>

        {/* Loyalty Card */}
        <div style={{ ...styles.loyaltyCard, background: `linear-gradient(135deg, ${currentTier.color}15, ${currentTier.color}05)`, borderColor: currentTier.color + '30' }}>
          <div style={styles.loyaltyLeft}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 36 }}>{currentTier.icon}</span>
              <div>
                <p style={{ fontSize: 11, color: '#8b8a96', fontWeight: 600, letterSpacing: 1 }}>YOUR TIER</p>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: currentTier.color, letterSpacing: 2 }}>{currentTier.name} Member</p>
              </div>
            </div>
            <div style={styles.pointsDisplay}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.4rem', color: '#f5c842' }}>{points}</span>
              <span style={{ color: '#8b8a96', fontSize: 14 }}>loyalty points</span>
            </div>
            {nextTier && (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: '#8b8a96' }}>Progress to {nextTier.icon} {nextTier.name}</span>
                  <span style={{ fontSize: 12, color: currentTier.color }}>{nextTier.min - points} pts to go</span>
                </div>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: `${Math.min(progress, 100)}%`, background: currentTier.color }} />
                </div>
              </div>
            )}
          </div>
          <div style={styles.loyaltyRight}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#4a4956', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Your Perks</p>
            {currentTier.perks.map(perk => (
              <div key={perk} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ color: currentTier.color, fontSize: 14 }}>✓</span>
                <span style={{ fontSize: 13, color: '#f0eff5' }}>{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How to earn points */}
        <div style={styles.howToEarn}>
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: 1, color: '#f0eff5', marginBottom: 14 }}>HOW TO EARN POINTS</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { icon: '🎟️', label: 'Book a ticket', pts: '₹10 = 1 point' },
              { icon: '🍿', label: 'Add food order', pts: '₹10 = 1 point' },
              { icon: '⭐', label: 'Write a review', pts: '+50 points' },
              { icon: '👥', label: 'Refer a friend', pts: '+100 points' },
            ].map(item => (
              <div key={item.label} style={styles.earnCard}>
                <span style={{ fontSize: 24 }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize: 13, color: '#f0eff5', fontWeight: 600 }}>{item.label}</p>
                  <p style={{ fontSize: 12, color: '#f5c842' }}>{item.pts}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Offers section */}
        <div style={{ marginTop: 40 }}>
          <h2 style={styles.sectionTitle}>💸 Active Coupons</h2>

          {/* Category filter */}
          <div style={styles.categoryRow}>
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                style={{ ...styles.catBtn, ...(category === c ? styles.catBtnActive : {}) }}>
                {c}
              </button>
            ))}
          </div>

          <div style={styles.offersGrid}>
            {filtered.map(offer => (
              <div key={offer.code} style={{ ...styles.offerCard, borderColor: offer.color + '25' }}>
                <div style={{ ...styles.offerHeader, background: offer.color + '15' }}>
                  <span style={{ fontSize: 32 }}>{offer.icon}</span>
                  <div style={{ ...styles.categoryTag, background: offer.color + '20', color: offer.color }}>
                    {offer.category}
                  </div>
                </div>
                <div style={styles.offerBody}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f0eff5', marginBottom: 6 }}>{offer.title}</h3>
                  <p style={{ fontSize: 13, color: '#8b8a96', lineHeight: 1.5, marginBottom: 12 }}>{offer.desc}</p>
                  <p style={{ fontSize: 11, color: '#4a4956', marginBottom: 14 }}>Valid till: {offer.validTill}</p>
                  <div style={styles.couponRow}>
                    <div style={{ ...styles.couponCode, borderColor: offer.color + '40', color: offer.color }}>
                      {offer.code}
                    </div>
                    <button
                      onClick={() => copyCode(offer.code)}
                      style={{ ...styles.copyBtn, background: offer.color, opacity: copied === offer.code ? 0.7 : 1 }}
                    >
                      {copied === offer.code ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All tiers */}
        <div style={{ marginTop: 48 }}>
          <h2 style={styles.sectionTitle}>🏆 Loyalty Tiers</h2>
          <div style={styles.tiersGrid}>
            {LOYALTY_TIERS.map(tier => {
              const isActive = tier.name === currentTier.name;
              return (
                <div key={tier.name} style={{ ...styles.tierCard, borderColor: isActive ? tier.color : tier.color + '20', background: isActive ? tier.color + '08' : '#13131f' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 28 }}>{tier.icon}</span>
                    <div>
                      <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: tier.color, letterSpacing: 1 }}>{tier.name}</p>
                      <p style={{ fontSize: 11, color: '#8b8a96' }}>{tier.min}–{tier.max === Infinity ? '∞' : tier.max} pts</p>
                    </div>
                    {isActive && <span style={{ marginLeft: 'auto', fontSize: 10, background: tier.color + '20', color: tier.color, padding: '3px 8px', borderRadius: 10, fontWeight: 700 }}>CURRENT</span>}
                  </div>
                  {tier.perks.map(p => (
                    <div key={p} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                      <span style={{ color: tier.color, fontSize: 12 }}>✓</span>
                      <span style={{ fontSize: 12, color: '#8b8a96' }}>{p}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  main: { maxWidth: 1200, margin: '0 auto', padding: '40px 24px' },
  pageTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', letterSpacing: 2, color: '#f0eff5', marginBottom: 28 },
  loyaltyCard: {
    display: 'flex', gap: 40, padding: '28px 32px',
    border: '1px solid', borderRadius: 20,
    marginBottom: 20, flexWrap: 'wrap',
  },
  loyaltyLeft: { flex: 1, minWidth: 280 },
  loyaltyRight: { flex: 1, minWidth: 200 },
  pointsDisplay: { display: 'flex', alignItems: 'baseline', gap: 8 },
  progressBar: { height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, transition: 'width 0.5s ease' },
  howToEarn: {
    background: '#13131f', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16, padding: '20px 24px', marginBottom: 8,
  },
  earnCard: {
    display: 'flex', gap: 12, alignItems: 'center',
    padding: '14px 18px', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, flex: 1, minWidth: 160,
  },
  sectionTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', letterSpacing: 1, color: '#f0eff5', marginBottom: 16 },
  categoryRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 },
  catBtn: {
    padding: '7px 18px', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20,
    color: '#8b8a96', fontFamily: "'Outfit', sans-serif",
    fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
  },
  catBtnActive: { background: 'rgba(232,55,42,0.1)', border: '1px solid rgba(232,55,42,0.3)', color: '#e8372a' },
  offersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  offerCard: {
    background: '#13131f', border: '1px solid',
    borderRadius: 16, overflow: 'hidden', transition: 'all 0.2s',
  },
  offerHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 20px',
  },
  categoryTag: { padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 },
  offerBody: { padding: '0 20px 20px' },
  couponRow: { display: 'flex', alignItems: 'center', gap: 10 },
  couponCode: {
    flex: 1, padding: '9px 14px',
    background: 'rgba(0,0,0,0.3)', border: '1px dashed',
    borderRadius: 8, fontFamily: 'monospace',
    fontSize: 15, fontWeight: 700, letterSpacing: 1,
  },
  copyBtn: {
    padding: '9px 16px', border: 'none', borderRadius: 8,
    color: 'white', fontFamily: "'Outfit', sans-serif",
    fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
  },
  tiersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 },
  tierCard: {
    padding: '20px', border: '1px solid',
    borderRadius: 14, transition: 'all 0.2s',
  },
};
