import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  { name: 'Electronics', icon: '📱', from: '#6366f1', to: '#8b5cf6' },
  { name: 'Clothing', icon: '👕', from: '#ec4899', to: '#db2777' },
  { name: 'Books', icon: '📚', from: '#10b981', to: '#059669' },
  { name: 'Home', icon: '🏠', from: '#f59e0b', to: '#f97316' },
  { name: 'Sports', icon: '⚽', from: '#3b82f6', to: '#2563eb' },
  { name: 'Beauty', icon: '💄', from: '#f43f5e', to: '#e11d48' },
];

function Skeleton() {
  return <div style={{ borderRadius: 20, paddingTop: '120%', background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />;
}

export default function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [f, l] = await Promise.all([
        productAPI.getAll('featured=true&limit=8'),
        productAPI.getAll('limit=8&sort=newest'),
      ]);
      setFeatured(f.products || []);
      setLatest(l.products || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <>
      <style>{css}</style>
      <div style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)', minHeight: '100vh' }}>
        {/* HERO */}
        <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #6d28d9 100%)' }}>
          <div style={{ position: 'absolute', top: -120, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.4), transparent 70%)', animation: 'blob 14s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: -150, left: -100, width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.35), transparent 70%)', animation: 'blob 18s ease-in-out infinite reverse' }} />
          <div className="hero-pad" style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <div style={{ animation: 'fadeUp 0.8s ease both' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', color: '#fff', padding: '7px 16px', borderRadius: 100, fontSize: 12.5, fontWeight: 700, marginBottom: 22, border: '1px solid rgba(255,255,255,0.2)' }}>✨ Premium Shopping Experience</span>
              <h1 className="hero-title" style={{ fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: -2, marginBottom: 18 }}>
                Shop Smarter at<br /><span style={{ background: 'linear-gradient(135deg, #fbbf24, #f472b6, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sultan Elite</span>
              </h1>
              <p className="hero-sub" style={{ color: 'rgba(255,255,255,0.8)', maxWidth: 580, margin: '0 auto 32px', lineHeight: 1.6 }}>Discover thousands of quality products at unbeatable prices. Fast delivery, secure payments.</p>
              <form onSubmit={handleSearch} style={{ maxWidth: 560, margin: '0 auto 30px', display: 'flex', gap: 8, background: '#fff', padding: 7, borderRadius: 16, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search products..." style={{ flex: 1, border: 'none', outline: 'none', padding: '12px 16px', fontSize: 15, borderRadius: 11, color: '#1e293b', minWidth: 0 }} />
                <button type="submit" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', padding: '12px 26px', borderRadius: 11, fontWeight: 800, fontSize: 14.5, cursor: 'pointer', whiteSpace: 'nowrap' }}>Search</button>
              </form>
              <div style={{ display: 'flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap' }}>
                {[{ n: '10K+', l: 'Products' }, { n: '50K+', l: 'Customers' }, { n: '99%', l: 'Satisfaction' }, { n: '24/7', l: 'Support' }].map((s, i) => (
                  <div key={s.l} style={{ textAlign: 'center', animation: `fadeUp 0.8s ease ${0.2 + i * 0.1}s both` }}>
                    <p style={{ fontSize: 26, fontWeight: 900, color: '#fff' }}>{s.n}</p>
                    <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <svg viewBox="0 0 1440 70" style={{ display: 'block', width: '100%', height: 60 }} preserveAspectRatio="none"><path d="M0,35 C360,75 1080,0 1440,35 L1440,70 L0,70 Z" fill="#f8fafc" /></svg>
        </div>

        <div className="container" style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* CATEGORIES */}
          <section style={{ marginBottom: 56 }}>
            <h2 className="sec-title" style={{ fontWeight: 900, color: '#0f172a', textAlign: 'center', marginBottom: 6, letterSpacing: -0.5 }}>Shop by Category</h2>
            <p style={{ color: '#64748b', fontSize: 15, textAlign: 'center', marginBottom: 32 }}>Find exactly what you're looking for</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
              {CATEGORIES.map((cat, i) => (
                <button key={cat.name} onClick={() => navigate(`/shop?category=${cat.name}`)} style={{ border: 'none', cursor: 'pointer', background: '#fff', borderRadius: 18, padding: '24px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)', animation: `cardIn 0.5s ease ${i * 0.07}s both` }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)'; }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg, ${cat.from}, ${cat.to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, boxShadow: `0 8px 20px ${cat.from}55` }}>{cat.icon}</div>
                  <span style={{ fontWeight: 700, fontSize: 13.5, color: '#1e293b' }}>{cat.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* FEATURES STRIP */}
          <section style={{ marginBottom: 56, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[{ icon: '🚚', t: 'Free Shipping', d: 'Orders over PKR 2,000', c: '#6366f1' }, { icon: '🔒', t: 'Secure Payment', d: '100% protected', c: '#10b981' }, { icon: '↩️', t: 'Easy Returns', d: '7-day policy', c: '#f59e0b' }, { icon: '💬', t: '24/7 Support', d: 'Always here', c: '#ec4899' }].map((f, i) => (
              <div key={f.t} style={{ background: '#fff', borderRadius: 16, padding: 20, display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', animation: `cardIn 0.5s ease ${i * 0.07}s both` }}>
                <div style={{ width: 48, height: 48, borderRadius: 13, background: f.c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, opacity: 0.95 }}>{f.icon}</div>
                <div><p style={{ fontWeight: 800, fontSize: 14.5, color: '#1e293b' }}>{f.t}</p><p style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>{f.d}</p></div>
              </div>
            ))}
          </section>

          {/* FEATURED */}
          <Section title="Featured Products" emoji="⭐" subtitle="Hand-picked favorites" to="/shop?featured=true" navigate={navigate} loading={loading} products={featured} />
          {/* LATEST */}
          <Section title="New Arrivals" emoji="🆕" subtitle="Fresh products added recently" to="/shop" navigate={navigate} loading={loading} products={latest} />

          {/* CTA */}
          <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #1e1b4b, #4c1d95)', borderRadius: 28, padding: '52px 32px', textAlign: 'center', marginBottom: 56 }}>
            <div style={{ position: 'absolute', top: -80, right: -40, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.4), transparent 70%)', animation: 'blob 12s ease-in-out infinite' }} />
            <div style={{ position: 'relative', zIndex: 2 }}>
              <h2 className="sec-title" style={{ fontWeight: 900, color: '#fff', marginBottom: 12, letterSpacing: -1 }}>Ready to Start Shopping?</h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>Join thousands of happy customers today.</p>
              <button onClick={() => navigate('/shop')} style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#1e1b4b', border: 'none', padding: '15px 40px', borderRadius: 14, fontWeight: 900, fontSize: 16, cursor: 'pointer', boxShadow: '0 12px 30px rgba(251,191,36,0.4)' }}>🛍️ Explore All Products</button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function Section({ title, emoji, subtitle, to, navigate, loading, products }) {
  return (
    <section style={{ marginBottom: 56 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="sec-title" style={{ fontWeight: 900, color: '#0f172a', letterSpacing: -0.5 }}>{emoji} {title}</h2>
          <p style={{ color: '#64748b', fontSize: 14.5, marginTop: 5 }}>{subtitle}</p>
        </div>
        <button onClick={() => navigate(to)} style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#6366f1', padding: '9px 18px', borderRadius: 11, fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>View All →</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 18 }}>
        {loading
          ? Array(8).fill(0).map((_, i) => <Skeleton key={i} />)
          : products.length > 0
            ? products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)
            : <p style={{ color: '#94a3b8', gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>No products yet. Add some from Admin panel!</p>}
      </div>
    </section>
  );
}

const css = `
  @keyframes fadeUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes cardIn { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes blob { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,-40px) scale(1.15); } }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .container { padding: 56px 20px; }
  .hero-pad { padding: 70px 20px 50px; }
  .hero-title { font-size: 56px; }
  .hero-sub { font-size: 19px; }
  .sec-title { font-size: 30px; }
  @media (max-width: 768px) {
    .container { padding: 40px 16px; }
    .hero-pad { padding: 48px 16px 36px; }
    .hero-title { font-size: 34px; }
    .hero-sub { font-size: 15px; }
    .sec-title { font-size: 24px; }
  }
`;
