import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';

// ✅ Inline placeholder - no external file needed
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f1f5f9" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" font-size="40" text-anchor="middle" dy=".3em" fill="%2394a3b8"%3E📦%3C/text%3E%3C/svg%3E';

// SafeImage with pre-load check (prevents 404 in console)
function SafeImage({ src, alt, style }) {
  const [imgSrc, setImgSrc] = useState(PLACEHOLDER_IMAGE);
  useEffect(() => {
    const clean = (src && typeof src === 'string' && src.trim()) || '';
    if (!clean) { setImgSrc(PLACEHOLDER_IMAGE); return; }
    let cancelled = false;
    const img = new Image();
    img.onload = () => { if (!cancelled) setImgSrc(clean); };
    img.onerror = () => { if (!cancelled) setImgSrc(PLACEHOLDER_IMAGE); };
    img.src = clean;
    return () => { cancelled = true; };
  }, [src]);
  return <img src={imgSrc} alt={alt} style={{ background: '#f1f5f9', ...style }} />;
}

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    icon: '⏳', color: '#f59e0b', bg: '#fffbeb', glow: 'rgba(245,158,11,0.3)', step: 1 },
  processing: { label: 'Processing', icon: '🔄', color: '#3b82f6', bg: '#eff6ff', glow: 'rgba(59,130,246,0.3)', step: 2 },
  shipped:    { label: 'Shipped',    icon: '🚚', color: '#6366f1', bg: '#eef2ff', glow: 'rgba(99,102,241,0.3)', step: 3 },
  delivered:  { label: 'Delivered',  icon: '✅', color: '#10b981', bg: '#ecfdf5', glow: 'rgba(16,185,129,0.3)', step: 4 },
  cancelled:  { label: 'Cancelled',  icon: '❌', color: '#ef4444', bg: '#fef2f2', glow: 'rgba(239,68,68,0.3)', step: 0 },
};

const STEPS = ['pending', 'processing', 'shipped', 'delivered'];

export default function Orders() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await orderAPI.getMyOrders();
      setOrders(Array.isArray(data) ? data : (data.orders || []));
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter((o) => o.status === filter);

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    spent: orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
  };

  // ─── LOADING STATE ───
  if (loading) {
    return (
      <>
        <style>{keyframes}</style>
        <div style={S.loadingWrap}>
          <div style={S.loadingCard}>
            <div style={S.loadingSpinner} />
            <p style={S.loadingText}>Loading your orders...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{keyframes}</style>
      <div style={S.page}>
        {/* Decorative background blobs */}
        <div style={S.blob1} />
        <div style={S.blob2} />

        <div style={S.container}>
          {/* ─── HEADER ─── */}
          <div style={{ ...S.header, animation: 'fadeSlideDown 0.6s ease both' }}>
            <div>
              <div style={S.badge}>
                <span style={S.badgeDot} />
                My Account
              </div>
              <h1 style={S.title}>Order History</h1>
              <p style={S.subtitle}>Track, manage, and review all your purchases</p>
            </div>
            <button onClick={() => navigate('/shop')} style={S.shopBtn}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(99,102,241,0.45)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(99,102,241,0.35)'; }}>
              <span style={{ fontSize: 18 }}>🛍️</span> Continue Shopping
            </button>
          </div>

          {/* ─── STATS CARDS ─── */}
          {orders.length > 0 && (
            <div style={S.statsGrid}>
              {[
                { label: 'Total Orders', value: stats.total, icon: '📦', from: '#6366f1', to: '#8b5cf6', delay: 0.1 },
                { label: 'In Progress', value: stats.pending, icon: '⏳', from: '#f59e0b', to: '#f97316', delay: 0.2 },
                { label: 'Delivered', value: stats.delivered, icon: '✅', from: '#10b981', to: '#059669', delay: 0.3 },
                { label: 'Total Spent', value: `PKR ${stats.spent.toLocaleString()}`, icon: '💰', from: '#ec4899', to: '#db2777', delay: 0.4, small: true },
              ].map((s) => (
                <div key={s.label} style={{
                  ...S.statCard,
                  background: `linear-gradient(135deg, ${s.from}, ${s.to})`,
                  animation: `fadeSlideUp 0.6s ease ${s.delay}s both`,
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}>
                  <div style={S.statShine} />
                  <div style={S.statIcon}>{s.icon}</div>
                  <p style={S.statLabel}>{s.label}</p>
                  <p style={{ ...S.statValue, fontSize: s.small ? 20 : 32 }}>{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* ─── ERROR ─── */}
          {error && (
            <div style={{ ...S.errorBox, animation: 'shake 0.5s ease' }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <div>
                <strong>Something went wrong</strong>
                <p style={{ fontSize: 13, opacity: 0.9, marginTop: 2 }}>{error}</p>
              </div>
              <button onClick={fetchOrders} style={S.retryBtn}>Retry</button>
            </div>
          )}

          {/* ─── FILTER TABS ─── */}
          {orders.length > 0 && (
            <div style={{ ...S.filterRow, animation: 'fadeSlideUp 0.6s ease 0.5s both' }}>
              {['all', 'pending', 'processing', 'shipped', 'delivered'].map((f) => {
                const active = filter === f;
                const cfg = STATUS_CONFIG[f];
                return (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    ...S.filterBtn,
                    background: active ? 'linear-gradient(135deg, #1e293b, #334155)' : '#fff',
                    color: active ? '#fff' : '#64748b',
                    boxShadow: active ? '0 6px 16px rgba(30,41,59,0.25)' : '0 2px 6px rgba(0,0,0,0.04)',
                    transform: active ? 'scale(1.05)' : 'none',
                  }}>
                    {f === 'all' ? '🗂️ All' : `${cfg.icon} ${cfg.label}`}
                  </button>
                );
              })}
            </div>
          )}

          {/* ─── EMPTY STATE ─── */}
          {filteredOrders.length === 0 ? (
            <div style={{ ...S.emptyCard, animation: 'fadeScaleIn 0.6s ease both' }}>
              <div style={S.emptyIconWrap}>
                <span style={{ fontSize: 64, animation: 'float 3s ease-in-out infinite' }}>📦</span>
              </div>
              <h2 style={S.emptyTitle}>
                {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
              </h2>
              <p style={S.emptyText}>
                {filter === 'all'
                  ? 'When you place your first order, it will appear here.'
                  : `You don't have any ${filter} orders right now.`}
              </p>
              {filter === 'all' ? (
                <button onClick={() => navigate('/shop')} style={S.emptyBtn}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}>
                  🛍️ Start Shopping
                </button>
              ) : (
                <button onClick={() => setFilter('all')} style={S.emptyBtnAlt}>
                  View all orders
                </button>
              )}
            </div>
          ) : (
            /* ─── ORDERS LIST ─── */
            <div style={S.ordersList}>
              {filteredOrders.map((order, idx) => {
                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                const isOpen = expandedId === order._id;
                const isCancelled = order.status === 'cancelled';
                return (
                  <div key={order._id} style={{
                    ...S.orderCard,
                    animation: `fadeSlideUp 0.5s ease ${0.1 * (idx % 6)}s both`,
                  }}>
                    {/* Accent bar */}
                    <div style={{ ...S.accentBar, background: `linear-gradient(180deg, ${cfg.color}, ${cfg.color}88)` }} />

                    {/* Card Header */}
                    <div style={S.cardHeader} onClick={() => setExpandedId(isOpen ? null : order._id)}>
                      <div style={S.cardHeaderLeft}>
                        <div style={{ ...S.statusCircle, background: cfg.bg, boxShadow: `0 0 0 4px ${cfg.glow}` }}>
                          <span style={{ fontSize: 22 }}>{cfg.icon}</span>
                        </div>
                        <div>
                          <div style={S.orderIdRow}>
                            <span style={S.orderId}>#{order._id.slice(-8).toUpperCase()}</span>
                            <span style={{ ...S.statusPill, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}>
                              {cfg.label}
                            </span>
                          </div>
                          <p style={S.orderDate}>🗓️ {formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                      <div style={S.cardHeaderRight}>
                        <div style={{ textAlign: 'right' }}>
                          <p style={S.totalLabel}>Total</p>
                          <p style={{ ...S.totalValue, color: cfg.color }}>PKR {order.totalPrice?.toLocaleString()}</p>
                        </div>
                        <span style={{ ...S.chevron, transform: isOpen ? 'rotate(180deg)' : 'none' }}>⌄</span>
                      </div>
                    </div>

                    {/* Progress Tracker */}
                    {!isCancelled && (
                      <div style={S.tracker}>
                        {STEPS.map((step, i) => {
                          const stepCfg = STATUS_CONFIG[step];
                          const done = cfg.step >= stepCfg.step;
                          const current = cfg.step === stepCfg.step;
                          return (
                            <div key={step} style={S.trackerStep}>
                              <div style={{
                                ...S.trackerDot,
                                background: done ? stepCfg.color : '#e2e8f0',
                                color: done ? '#fff' : '#94a3b8',
                                transform: current ? 'scale(1.15)' : 'scale(1)',
                                boxShadow: current ? `0 0 0 4px ${stepCfg.glow}` : 'none',
                                animation: current ? 'pulse 2s ease-in-out infinite' : 'none',
                              }}>
                                {done ? stepCfg.icon : i + 1}
                              </div>
                              <span style={{ ...S.trackerLabel, color: done ? stepCfg.color : '#94a3b8', fontWeight: current ? 700 : 500 }}>
                                {stepCfg.label}
                              </span>
                              {i < STEPS.length - 1 && (
                                <div style={{
                                  ...S.trackerLine,
                                  background: cfg.step > stepCfg.step ? stepCfg.color : '#e2e8f0',
                                }} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Expandable Details */}
                    <div style={{
                      ...S.details,
                      maxHeight: isOpen ? 1200 : 0,
                      opacity: isOpen ? 1 : 0,
                      paddingTop: isOpen ? 20 : 0,
                      paddingBottom: isOpen ? 24 : 0,
                    }}>
                      {/* Items */}
                      <h4 style={S.detailHeading}>🛒 Order Items ({order.orderItems?.length || 0})</h4>
                      <div style={S.itemsList}>
                        {order.orderItems?.map((item, i) => (
                          <div key={i} style={S.itemRow}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.transform = 'none'; }}>
                            <SafeImage src={item.image} alt={item.name} style={S.itemImg} />
                            <div style={{ flex: 1 }}>
                              <p style={S.itemName}>{item.name || 'Product'}</p>
                              <p style={S.itemQty}>Qty: {item.quantity} × PKR {item.price?.toLocaleString()}</p>
                            </div>
                            <p style={S.itemTotal}>PKR {(item.quantity * item.price)?.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>

                      {/* Footer info grid */}
                      <div style={S.infoGrid}>
                        {order.shippingAddress && (
                          <div style={S.infoBox}>
                            <p style={S.infoLabel}>📍 Shipping Address</p>
                            <p style={S.infoValue}>
                              {order.shippingAddress.address}<br />
                              {order.shippingAddress.city}
                              {order.shippingAddress.phone && <><br />📞 {order.shippingAddress.phone}</>}
                              <br />{order.shippingAddress.country}
                            </p>
                          </div>
                        )}
                        <div style={S.infoBox}>
                          <p style={S.infoLabel}>💳 Payment Method</p>
                          <p style={S.infoValue}>{order.paymentMethod || 'Cash on Delivery'}</p>
                          <p style={{ ...S.infoLabel, marginTop: 12 }}>📊 Payment Status</p>
                          <p style={{ ...S.infoValue, color: order.isPaid ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                            {order.isPaid ? '✅ Paid' : '⏳ Pending'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════ ANIMATIONS ═══════════════════════════
const keyframes = `
  @keyframes fadeSlideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeScaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
  @keyframes pulse { 0%, 100% { transform: scale(1.15); } 50% { transform: scale(1.25); } }
  @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes blobFloat { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-30px) scale(1.1); } }
`;

// ═══════════════════════════ STYLES ═══════════════════════════
const S = {
  page: { minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)', padding: '48px 0', position: 'relative', overflow: 'hidden', fontFamily: "'Segoe UI', system-ui, sans-serif" },
  blob1: { position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)', animation: 'blobFloat 12s ease-in-out infinite', pointerEvents: 'none' },
  blob2: { position: 'absolute', bottom: -150, left: -100, width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.1), transparent 70%)', animation: 'blobFloat 15s ease-in-out infinite reverse', pointerEvents: 'none' },
  container: { maxWidth: 1080, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 },

  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20, marginBottom: 36 },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, color: '#6366f1', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 14, letterSpacing: 0.5, textTransform: 'uppercase' },
  badgeDot: { width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' },
  title: { fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#0f172a', letterSpacing: -1, lineHeight: 1 },
  subtitle: { color: '#64748b', fontSize: 16, marginTop: 10 },
  shopBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', padding: '14px 26px', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 8px 20px rgba(99,102,241,0.35)', transition: 'all 0.25s ease' },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 32 },
  statCard: { position: 'relative', padding: 24, borderRadius: 20, color: '#fff', overflow: 'hidden', cursor: 'default', transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: '0 10px 30px rgba(0,0,0,0.12)' },
  statShine: { position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' },
  statIcon: { fontSize: 28, marginBottom: 10 },
  statLabel: { fontSize: 13, fontWeight: 600, opacity: 0.9, marginBottom: 6 },
  statValue: { fontWeight: 900, lineHeight: 1 },

  errorBox: { display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444', color: '#991b1b', padding: '16px 20px', borderRadius: 14, marginBottom: 24, boxShadow: '0 4px 12px rgba(239,68,68,0.1)' },
  retryBtn: { marginLeft: 'auto', background: '#ef4444', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 13 },

  filterRow: { display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' },
  filterBtn: { border: 'none', padding: '10px 20px', borderRadius: 100, fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)' },

  emptyCard: { background: '#fff', borderRadius: 28, padding: '80px 40px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.06)' },
  emptyIconWrap: { width: 120, height: 120, margin: '0 auto 24px', borderRadius: '50%', background: 'linear-gradient(135deg, #eef2ff, #faf5ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 10 },
  emptyText: { color: '#64748b', fontSize: 16, marginBottom: 28, maxWidth: 380, margin: '0 auto 28px' },
  emptyBtn: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', padding: '15px 36px', borderRadius: 14, fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 8px 20px rgba(99,102,241,0.35)', transition: 'all 0.25s ease' },
  emptyBtnAlt: { background: '#f1f5f9', color: '#475569', border: 'none', padding: '13px 28px', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer' },

  ordersList: { display: 'flex', flexDirection: 'column', gap: 20 },
  orderCard: { position: 'relative', background: '#fff', borderRadius: 22, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' },
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },

  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 26px 22px 30px', cursor: 'pointer', flexWrap: 'wrap', gap: 16 },
  cardHeaderLeft: { display: 'flex', alignItems: 'center', gap: 16 },
  statusCircle: { width: 52, height: 52, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  orderIdRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' },
  orderId: { fontSize: 17, fontWeight: 800, color: '#0f172a', fontFamily: 'monospace', letterSpacing: 0.5 },
  statusPill: { fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: 0.5 },
  orderDate: { fontSize: 13, color: '#94a3b8', fontWeight: 500 },
  cardHeaderRight: { display: 'flex', alignItems: 'center', gap: 18 },
  totalLabel: { fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 },
  totalValue: { fontSize: 22, fontWeight: 900, marginTop: 2 },
  chevron: { fontSize: 28, color: '#cbd5e1', transition: 'transform 0.3s ease', fontWeight: 700, lineHeight: 1 },

  tracker: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '0 30px 24px', position: 'relative' },
  trackerStep: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' },
  trackerDot: { width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, zIndex: 2, transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)' },
  trackerLabel: { fontSize: 12, marginTop: 8, transition: 'all 0.3s ease' },
  trackerLine: { position: 'absolute', top: 19, left: '50%', width: '100%', height: 3, zIndex: 1, transition: 'background 0.5s ease', borderRadius: 2 },

  details: { overflow: 'hidden', transition: 'max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease, padding 0.4s ease', padding: '0 30px', borderTop: '1px dashed #e2e8f0' },
  detailHeading: { fontSize: 15, fontWeight: 800, color: '#1e293b', marginBottom: 14 },
  itemsList: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 },
  itemRow: { display: 'flex', alignItems: 'center', gap: 14, padding: 12, background: '#f8fafc', borderRadius: 14, transition: 'all 0.2s ease', cursor: 'default' },
  itemImg: { width: 56, height: 56, objectFit: 'cover', borderRadius: 10, border: '1px solid #e2e8f0', flexShrink: 0 },
  itemName: { fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 3 },
  itemQty: { fontSize: 13, color: '#64748b' },
  itemTotal: { fontSize: 15, fontWeight: 800, color: '#6366f1' },

  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 },
  infoBox: { background: '#f8fafc', borderRadius: 14, padding: 18, border: '1px solid #f1f5f9' },
  infoLabel: { fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  infoValue: { fontSize: 14, color: '#334155', lineHeight: 1.6, fontWeight: 500 },

  loadingWrap: { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #f8fafc, #eef2ff)' },
  loadingCard: { textAlign: 'center' },
  loadingSpinner: { width: 56, height: 56, margin: '0 auto 20px', border: '4px solid #e0e7ff', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.9s linear infinite' },
  loadingText: { color: '#64748b', fontWeight: 600, fontSize: 16 },
};
