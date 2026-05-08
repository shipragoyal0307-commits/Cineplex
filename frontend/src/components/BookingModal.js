import React, { useState } from 'react';
import { bookingAPI } from '../utils/api';

const SEATS_PER_ROW = 10;
const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const BLOCKED = ['A3', 'A4', 'D7', 'E2', 'F8', 'G5'];

const FOOD = [
  { id: 'f1', item: 'Large Popcorn (Butter)', price: 220, emoji: '🍿' },
  { id: 'f2', item: 'Combo (Popcorn + Coke)', price: 350, emoji: '🥤' },
  { id: 'f3', item: 'Nachos with Cheese', price: 180, emoji: '🧀' },
  { id: 'f4', item: 'Hot Dog', price: 160, emoji: '🌭' },
];

const COUPONS = {
  FIRST50: 50,
  MOVIE100: 100,
  IMAX150: 150,
};

export default function BookingModal({ movie, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1=show, 2=seats, 3=food, 4=payment
  const [selected, setSelected] = useState({ showtime: null, date: null, seats: [], food: {}, coupon: '', paymentMethod: 'card' });
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const toggleSeat = (seatId) => {
    if (BLOCKED.includes(seatId)) return;
    setSelected(s => ({
      ...s,
      seats: s.seats.includes(seatId)
        ? s.seats.filter(id => id !== seatId)
        : s.seats.length >= 8 ? s.seats : [...s.seats, seatId]
    }));
  };

  const toggleFood = (food) => {
    setSelected(s => ({
      ...s,
      food: { ...s.food, [food.id]: s.food[food.id] ? undefined : food }
    }));
  };

  const applyCoupon = () => {
    const disc = COUPONS[couponInput.toUpperCase()];
    if (disc) {
      setSelected(s => ({ ...s, coupon: couponInput.toUpperCase() }));
      setCouponMsg(`✅ ₹${disc} discount applied!`);
    } else {
      setCouponMsg('❌ Invalid coupon code');
    }
  };

  const getSeatPrice = () => {
    if (!selected.showtime) return 0;
    return selected.showtime.price * selected.seats.length;
  };

  const getFoodTotal = () => {
    return Object.values(selected.food).filter(Boolean).reduce((sum, f) => sum + f.price, 0);
  };

  const getDiscount = () => COUPONS[selected.coupon] || 0;

  const getTotal = () => getSeatPrice() + getFoodTotal();
  const getFinal = () => Math.max(0, getTotal() - getDiscount());

  const handleBooking = async () => {
    setLoading(true);
    try {
      const foodOrders = Object.values(selected.food).filter(Boolean).map(f => ({
        item: f.item, quantity: 1, price: f.price
      }));

      const { data } = await bookingAPI.create({
        movieId: movie._id,
        theater: selected.showtime.theater,
        showDate: selected.date,
        showTime: selected.showtime.time,
        format: selected.showtime.format,
        seats: selected.seats,
        totalAmount: getTotal(),
        discount: getDiscount(),
        couponUsed: selected.coupon,
        foodOrders,
        paymentMethod: selected.paymentMethod,
      });

      if (data.success) setConfirmed(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    }
    setLoading(false);
  };

  if (confirmed) {
    return (
      <div style={mStyles.overlay} onClick={onClose}>
        <div style={mStyles.modal} onClick={e => e.stopPropagation()}>
          <div style={{ textAlign: 'center', padding: '40px 32px' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#f0eff5', letterSpacing: 2 }}>
              BOOKING CONFIRMED!
            </h2>
            <p style={{ color: '#8b8a96', marginBottom: 24 }}>Your tickets are ready</p>
            <div style={mStyles.ticketCard}>
              <div style={mStyles.ticketRow}><span>Movie</span><strong>{movie.title}</strong></div>
              <div style={mStyles.ticketRow}><span>Booking ID</span><strong style={{ color: '#e8372a' }}>{confirmed.booking.bookingId}</strong></div>
              <div style={mStyles.ticketRow}><span>Theater</span><strong>{confirmed.booking.theater}</strong></div>
              <div style={mStyles.ticketRow}><span>Date & Time</span><strong>{new Date(confirmed.booking.showDate).toLocaleDateString()} • {confirmed.booking.showTime}</strong></div>
              <div style={mStyles.ticketRow}><span>Seats</span><strong>{confirmed.booking.seats.join(', ')}</strong></div>
              <div style={mStyles.ticketRow}><span>Format</span><strong>{confirmed.booking.format}</strong></div>
              <div style={{ ...mStyles.ticketRow, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12, marginTop: 4 }}>
                <span>Amount Paid</span><strong style={{ color: '#22c55e', fontSize: 18 }}>₹{confirmed.booking.finalAmount}</strong>
              </div>
              <div style={mStyles.ticketRow}><span>Points Earned</span><strong style={{ color: '#f5c842' }}>+{confirmed.pointsEarned} ⭐</strong></div>
            </div>
            <button onClick={() => { onSuccess && onSuccess(); onClose(); }} style={mStyles.confirmBtn}>
              🏠 Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={mStyles.overlay} onClick={onClose}>
      <div style={mStyles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={mStyles.header}>
          <div>
            <h3 style={mStyles.headerTitle}>{movie.title}</h3>
            <div style={mStyles.stepIndicator}>
              {['Showtime', 'Seats', 'Food & Drinks', 'Payment'].map((s, i) => (
                <React.Fragment key={s}>
                  <span style={{ ...mStyles.stepDot, ...(step > i + 1 ? mStyles.stepDone : step === i + 1 ? mStyles.stepActive : {}) }}>
                    {step > i + 1 ? '✓' : i + 1}
                  </span>
                  <span style={{ ...mStyles.stepLabel, color: step === i + 1 ? '#e8372a' : '#4a4956' }}>{s}</span>
                  {i < 3 && <div style={{ ...mStyles.stepLine, background: step > i + 1 ? '#e8372a' : 'rgba(255,255,255,0.08)' }} />}
                </React.Fragment>
              ))}
            </div>
          </div>
          <button onClick={onClose} style={mStyles.closeBtn}>✕</button>
        </div>

        <div style={mStyles.body}>
          {/* Step 1: Showtime */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <p style={mStyles.subLabel}>SELECT DATE</p>
                <div style={mStyles.dateRow}>
                  {dates.map(d => {
                    const dateStr = d.toDateString();
                    const isToday = d.toDateString() === today.toDateString();
                    return (
                      <button
                        key={dateStr}
                        onClick={() => setSelected(s => ({ ...s, date: d.toISOString() }))}
                        style={{ ...mStyles.dateBtn, ...(selected.date && new Date(selected.date).toDateString() === dateStr ? mStyles.dateBtnActive : {}) }}
                      >
                        <span style={{ fontSize: 10, color: 'inherit' }}>{d.toLocaleDateString('en', { weekday: 'short' }).toUpperCase()}</span>
                        <span style={{ fontSize: 20, fontWeight: 700 }}>{d.getDate()}</span>
                        <span style={{ fontSize: 10, color: 'inherit' }}>{isToday ? 'TODAY' : d.toLocaleDateString('en', { month: 'short' })}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p style={mStyles.subLabel}>SELECT SHOWTIME</p>
                {movie.showtimes?.map((s, i) => (
                  <div
                    key={i}
                    onClick={() => setSelected(prev => ({ ...prev, showtime: s }))}
                    style={{
                      ...mStyles.showtimeCard,
                      ...(selected.showtime === s ? mStyles.showtimeActive : {})
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 700, color: '#f0eff5', fontSize: 16 }}>{s.time}</p>
                      <p style={{ fontSize: 12, color: '#8b8a96' }}>{s.theater}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ ...mStyles.formatBadge, ...(s.format === 'IMAX' ? mStyles.formatIMAX : s.format === '3D' ? mStyles.format3D : s.format === '4DX' ? mStyles.format4DX : {}) }}>
                        {s.format}
                      </span>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#22c55e', marginTop: 4 }}>₹{s.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Seat selection */}
          {step === 2 && (
            <div>
              <div style={mStyles.screen}>🎬 SCREEN</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                {ROWS.map(row => (
                  <div key={row} style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                    <span style={{ width: 16, fontSize: 11, color: '#4a4956', fontWeight: 700 }}>{row}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {Array.from({ length: SEATS_PER_ROW }, (_, i) => {
                        const seatId = `${row}${i + 1}`;
                        const isBlocked = BLOCKED.includes(seatId);
                        const isSelected = selected.seats.includes(seatId);
                        return (
                          <button
                            key={seatId}
                            onClick={() => toggleSeat(seatId)}
                            disabled={isBlocked}
                            title={seatId}
                            style={{
                              ...mStyles.seat,
                              ...(isBlocked ? mStyles.seatBlocked : isSelected ? mStyles.seatSelected : mStyles.seatAvailable),
                              ...(i === 4 ? { marginRight: 16 } : {})
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div style={mStyles.seatLegend}>
                {[
                  { style: mStyles.seatAvailable, label: 'Available' },
                  { style: mStyles.seatSelected, label: 'Selected' },
                  { style: mStyles.seatBlocked, label: 'Booked' },
                ].map(({ style, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ ...mStyles.seat, ...style, cursor: 'default' }} />
                    <span style={{ fontSize: 12, color: '#8b8a96' }}>{label}</span>
                  </div>
                ))}
              </div>
              <p style={{ textAlign: 'center', color: '#e8372a', fontSize: 13, marginTop: 12 }}>
                Selected: {selected.seats.length > 0 ? selected.seats.join(', ') : 'None'} (Max 8)
              </p>
            </div>
          )}

          {/* Step 3: Food */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={mStyles.subLabel}>ADD FOOD & BEVERAGES (OPTIONAL)</p>
              {FOOD.map(food => (
                <div
                  key={food.id}
                  onClick={() => toggleFood(food)}
                  style={{
                    ...mStyles.foodCard,
                    ...(selected.food[food.id] ? mStyles.foodActive : {})
                  }}
                >
                  <span style={{ fontSize: 28 }}>{food.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, color: '#f0eff5', fontSize: 14 }}>{food.item}</p>
                    <p style={{ color: '#22c55e', fontSize: 13, fontWeight: 700 }}>₹{food.price}</p>
                  </div>
                  <div style={{
                    width: 22, height: 22,
                    borderRadius: '50%',
                    background: selected.food[food.id] ? '#e8372a' : 'transparent',
                    border: `2px solid ${selected.food[food.id] ? '#e8372a' : 'rgba(255,255,255,0.2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 12,
                  }}>
                    {selected.food[food.id] ? '✓' : ''}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Payment */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Coupon */}
              <div>
                <p style={mStyles.subLabel}>PROMO CODE</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={couponInput}
                    onChange={e => { setCouponInput(e.target.value); setCouponMsg(''); }}
                    placeholder="Enter coupon (e.g. FIRST50)"
                    style={mStyles.couponInput}
                  />
                  <button onClick={applyCoupon} style={mStyles.applyBtn}>Apply</button>
                </div>
                {couponMsg && <p style={{ fontSize: 12, marginTop: 6, color: couponMsg.startsWith('✅') ? '#22c55e' : '#e8372a' }}>{couponMsg}</p>}
                <p style={{ fontSize: 11, color: '#4a4956', marginTop: 6 }}>Try: FIRST50 | MOVIE100 | IMAX150</p>
              </div>

              {/* Payment method */}
              <div>
                <p style={mStyles.subLabel}>PAYMENT METHOD</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { id: 'card', label: '💳 Card' },
                    { id: 'upi', label: '📱 UPI' },
                    { id: 'netbanking', label: '🏦 Net Banking' },
                    { id: 'wallet', label: '👜 Wallet' },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelected(s => ({ ...s, paymentMethod: m.id }))}
                      style={{
                        ...mStyles.payBtn,
                        ...(selected.paymentMethod === m.id ? mStyles.payBtnActive : {})
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order summary */}
              <div style={mStyles.summary}>
                <p style={{ fontWeight: 700, color: '#f0eff5', marginBottom: 12 }}>Order Summary</p>
                <div style={mStyles.summaryRow}><span>Tickets ({selected.seats.length})</span><span>₹{getSeatPrice()}</span></div>
                {getFoodTotal() > 0 && <div style={mStyles.summaryRow}><span>Food & Beverages</span><span>₹{getFoodTotal()}</span></div>}
                {getDiscount() > 0 && <div style={{ ...mStyles.summaryRow, color: '#22c55e' }}><span>Discount</span><span>-₹{getDiscount()}</span></div>}
                <div style={{ ...mStyles.summaryRow, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12, marginTop: 8, fontWeight: 700, fontSize: 16, color: '#f0eff5' }}>
                  <span>Total</span><span style={{ color: '#22c55e' }}>₹{getFinal()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={mStyles.footer}>
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} style={mStyles.backBtn}>← Back</button>
          )}
          <div style={{ flex: 1 }} />
          {step < 4 ? (
            <button
              onClick={() => {
                if (step === 1 && (!selected.date || !selected.showtime)) {
                  alert('Please select date and showtime');
                  return;
                }
                if (step === 2 && selected.seats.length === 0) {
                  alert('Please select at least one seat');
                  return;
                }
                setStep(step + 1);
              }}
              style={mStyles.nextBtn}
            >
              {step === 3 ? 'Proceed to Payment →' : 'Continue →'}
            </button>
          ) : (
            <button onClick={handleBooking} disabled={loading} style={mStyles.nextBtn}>
              {loading ? 'Processing...' : `💳 Pay ₹${getFinal()} & Confirm`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const mStyles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(8px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    animation: 'fadeIn 0.2s ease',
  },
  modal: {
    background: '#13131f',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 20,
    width: '100%',
    maxWidth: 580,
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    animation: 'fadeUp 0.3s ease',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  headerTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '1.4rem',
    letterSpacing: 1,
    color: '#f0eff5',
    marginBottom: 12,
  },
  stepIndicator: { display: 'flex', alignItems: 'center', gap: 6 },
  stepDot: {
    width: 22, height: 22,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#4a4956',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 10, fontWeight: 700,
  },
  stepActive: { background: '#e8372a', border: '1px solid #e8372a', color: 'white' },
  stepDone: { background: '#22c55e', border: '1px solid #22c55e', color: 'white' },
  stepLabel: { fontSize: 11, fontWeight: 600 },
  stepLine: { width: 20, height: 1 },
  closeBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#8b8a96',
    cursor: 'pointer',
    width: 32, height: 32,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14,
  },
  body: { flex: 1, overflowY: 'auto', padding: '24px' },
  footer: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 24px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    gap: 12,
  },
  backBtn: {
    padding: '10px 18px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    color: '#8b8a96',
    cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif",
    fontSize: 14,
  },
  nextBtn: {
    padding: '12px 24px',
    background: '#e8372a',
    border: 'none',
    borderRadius: 10,
    color: 'white',
    cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif",
    fontSize: 14,
    fontWeight: 700,
  },
  subLabel: { fontSize: 11, fontWeight: 700, color: '#4a4956', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 },
  dateRow: { display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 },
  dateBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    cursor: 'pointer',
    color: '#8b8a96',
    minWidth: 56,
    gap: 2,
    fontFamily: "'Outfit', sans-serif",
    transition: 'all 0.15s',
  },
  dateBtnActive: { background: 'rgba(232,55,42,0.15)', border: '1px solid #e8372a', color: '#e8372a' },
  showtimeCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 10,
    cursor: 'pointer',
    marginBottom: 8,
    transition: 'all 0.15s',
  },
  showtimeActive: { background: 'rgba(232,55,42,0.1)', border: '1px solid rgba(232,55,42,0.4)' },
  formatBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: 5,
    fontSize: 11,
    fontWeight: 700,
    background: 'rgba(255,255,255,0.08)',
    color: '#8b8a96',
  },
  formatIMAX: { background: 'rgba(232,55,42,0.2)', color: '#e8372a' },
  format3D: { background: 'rgba(59,130,246,0.2)', color: '#3b82f6' },
  format4DX: { background: 'rgba(168,85,247,0.2)', color: '#a855f7' },
  screen: {
    textAlign: 'center',
    padding: '8px 0',
    background: 'linear-gradient(to bottom, rgba(232,55,42,0.3), transparent)',
    borderRadius: '60% 60% 0 0 / 40px 40px 0 0',
    color: '#e8372a',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 4,
    marginBottom: 24,
  },
  seat: {
    width: 22, height: 20,
    borderRadius: '4px 4px 0 0',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.1s',
  },
  seatAvailable: { background: 'rgba(255,255,255,0.12)', cursor: 'pointer' },
  seatSelected: { background: '#e8372a', cursor: 'pointer' },
  seatBlocked: { background: 'rgba(255,255,255,0.04)', cursor: 'not-allowed', opacity: 0.4 },
  seatLegend: { display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' },
  foodCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '14px 16px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  foodActive: { background: 'rgba(232,55,42,0.08)', border: '1px solid rgba(232,55,42,0.3)' },
  couponInput: {
    flex: 1,
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#f0eff5',
    fontFamily: "'Outfit', sans-serif",
    fontSize: 14,
    outline: 'none',
    letterSpacing: 1,
  },
  applyBtn: {
    padding: '10px 18px',
    background: '#e8372a',
    border: 'none',
    borderRadius: 8,
    color: 'white',
    fontFamily: "'Outfit', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  },
  payBtn: {
    padding: '10px 16px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    color: '#8b8a96',
    fontFamily: "'Outfit', sans-serif",
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  payBtnActive: { background: 'rgba(232,55,42,0.1)', border: '1px solid #e8372a', color: '#e8372a' },
  summary: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12,
    padding: '16px',
  },
  summaryRow: { display: 'flex', justifyContent: 'space-between', color: '#8b8a96', fontSize: 14, marginBottom: 8 },
  ticketCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: '16px 20px',
    textAlign: 'left',
    marginBottom: 24,
  },
  ticketRow: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#8b8a96',
    fontSize: 13,
    marginBottom: 10,
    alignItems: 'center',
  },
  confirmBtn: {
    width: '100%',
    padding: '14px',
    background: '#e8372a',
    border: 'none',
    borderRadius: 12,
    color: 'white',
    fontFamily: "'Outfit', sans-serif",
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  },
};
