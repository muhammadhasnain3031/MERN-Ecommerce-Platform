import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', color: '#fff', marginTop: 'auto' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 36, marginBottom: 36 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
              <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21 }}>🛒</div>
              <div><h3 style={{ fontSize: 16, fontWeight: 900 }}>Sultan Elite</h3><p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>PREMIUM STORE</p></div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.6, marginBottom: 18 }}>Your trusted online shopping destination for quality products at great prices.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              {['📘', '🐦', '📷', '💼'].map((ic, i) => (
                <button key={i} type="button" style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.1)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'none'; }}>{ic}</button>
              ))}
            </div>
          </div>
          {/* Quick Links */}
          <div>
            <h4 style={fHead}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[{ to: '/', l: 'Home' }, { to: '/shop', l: 'Shop' }, { to: '/cart', l: 'Cart' }, { to: '/wishlist', l: 'Wishlist' }, { to: '/orders', l: 'My Orders' }].map((x) => (
                <li key={x.to} style={{ marginBottom: 9 }}><Link to={x.to} style={fLink}>{x.l}</Link></li>
              ))}
            </ul>
          </div>
          {/* Service */}
          <div>
            <h4 style={fHead}>Customer Service</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Help Center', 'Track Order', 'Returns', 'Shipping Info', 'FAQs'].map((x) => (
                <li key={x} style={{ marginBottom: 9 }}><button type="button" style={{ ...fLink, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>{x}</button></li>
              ))}
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h4 style={fHead}>Contact Us</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: 'rgba(255,255,255,0.65)', fontSize: 14 }}><span>📧</span> support@sultanelite.com</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: 'rgba(255,255,255,0.65)', fontSize: 14 }}><span>📞</span> +92 300 1234567</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: 'rgba(255,255,255,0.65)', fontSize: 14 }}><span>📍</span> Lahore, Pakistan</div>
            </div>
          </div>
        </div>
        <div style={{ paddingTop: 22, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>© {year} Sultan Elite Store. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>{['Privacy', 'Terms', 'Cookies'].map((x) => <button key={x} type="button" style={{ color: 'rgba(255,255,255,0.55)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5 }}>{x}</button>)}</div>
        </div>
      </div>
      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 28, flexWrap: 'wrap' }}>
          {[{ i: '🔒', t: 'Secure Payment' }, { i: '✅', t: '100% Authentic' }, { i: '🚚', t: 'Fast Delivery' }, { i: '↩️', t: 'Easy Returns' }].map((b) => (
            <div key={b.t} style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span>{b.i}</span><span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{b.t}</span></div>
          ))}
        </div>
      </div>
    </footer>
  );
}
const fHead = { fontSize: 13, fontWeight: 700, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 };
const fLink = { color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' };
