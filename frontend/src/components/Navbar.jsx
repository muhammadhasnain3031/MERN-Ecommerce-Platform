import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { resetCart } from '../store/cartSlice';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { items } = useSelector((s) => s.cart);
  const wishlist = useSelector((s) => s.wishlist?.items || []);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Close menus on route change
  useEffect(() => { setMenuOpen(false); setProfileOpen(false); }, [location.pathname]);

  // Navbar shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdowns clicking outside
  useEffect(() => {
    const handleClick = () => { setProfileOpen(false); };
    if (profileOpen) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [profileOpen]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetCart());
    navigate('/');
    setProfileOpen(false);
    setMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/shop', label: 'Shop', icon: '🛍️' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{css}</style>
      <nav style={{
        background: 'rgba(30, 27, 75, 0.95)',
        backdropFilter: 'blur(12px)',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.25)' : '0 2px 12px rgba(0,0,0,0.1)',
        position: 'sticky', top: 0, zIndex: 1000,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        transition: 'box-shadow 0.3s',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 11, flexShrink: 0 }}>
            <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 6px 16px rgba(251,191,36,0.4)' }}>🛒</div>
            <div>
              <h1 style={{ color: '#fff', fontSize: 17, fontWeight: 900, lineHeight: 1, letterSpacing: -0.3 }}>Sultan Elite</h1>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: 600, letterSpacing: 0.5, marginTop: 2 }}>PREMIUM STORE</p>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="nav-desktop" style={{ alignItems: 'center', gap: 6 }}>
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} style={{
                color: isActive(link.to) ? '#fff' : 'rgba(255,255,255,0.75)',
                textDecoration: 'none', padding: '8px 16px', borderRadius: 10, fontWeight: 600, fontSize: 14.5,
                background: isActive(link.to) ? 'rgba(255,255,255,0.12)' : 'transparent',
                transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
                onMouseEnter={(e) => { if (!isActive(link.to)) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={(e) => { if (!isActive(link.to)) e.currentTarget.style.background = 'transparent'; }}>
                <span>{link.icon}</span>{link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Wishlist (desktop) */}
            <Link to="/wishlist" className="nav-desktop-flex" style={iconBtn} title="Wishlist">
              ❤️
              {wishlist.length > 0 && <span style={badge}>{wishlist.length}</span>}
            </Link>

            {/* Cart */}
            <Link to="/cart" style={{ ...iconBtn, display: 'flex' }} title="Cart">
              🛒
              {cartCount > 0 && <span style={badge}>{cartCount > 9 ? '9+' : cartCount}</span>}
            </Link>

            {/* User (desktop) */}
            {user ? (
              <div className="nav-desktop-flex" style={{ position: 'relative' }}>
                <button onClick={(e) => { e.stopPropagation(); setProfileOpen(!profileOpen); }} style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none',
                  padding: '8px 14px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 7, boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
                }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>
                    {(user.name || 'U')[0].toUpperCase()}
                  </span>
                  {(user.name || 'User').split(' ')[0]}
                  <span style={{ fontSize: 9 }}>▼</span>
                </button>
                {profileOpen && (
                  <div onClick={(e) => e.stopPropagation()} style={dropdown}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                      <p style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{user.name}</p>
                      <p style={{ fontSize: 12, color: '#64748b', marginTop: 2, wordBreak: 'break-all' }}>{user.email}</p>
                    </div>
                    <Link to="/orders" style={dropItem}>📦 My Orders</Link>
                    <Link to="/wishlist" style={dropItem}>❤️ Wishlist</Link>
                    {user.isAdmin && <Link to="/admin" style={{ ...dropItem, borderTop: '1px solid #f1f5f9' }}>⚙️ Admin Panel</Link>}
                    <button onClick={handleLogout} style={{ ...dropItem, width: '100%', border: 'none', borderTop: '1px solid #f1f5f9', background: 'none', color: '#ef4444', cursor: 'pointer', textAlign: 'left' }}>🚪 Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="nav-desktop-flex" style={{ gap: 8 }}>
                <Link to="/login" style={{ color: '#fff', textDecoration: 'none', padding: '8px 16px', borderRadius: 10, fontWeight: 600, fontSize: 14, border: '1.5px solid rgba(255,255,255,0.25)' }}>Login</Link>
                <Link to="/register" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#1e1b4b', textDecoration: 'none', padding: '8px 18px', borderRadius: 10, fontWeight: 800, fontSize: 14, boxShadow: '0 4px 12px rgba(251,191,36,0.4)' }}>Sign Up</Link>
              </div>
            )}

            {/* Hamburger (mobile) */}
            <button className="nav-hamburger" onClick={() => setMenuOpen(true)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>☰</button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div onClick={() => setMenuOpen(false)} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100,
        opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? 'auto' : 'none', transition: 'opacity 0.3s',
      }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(82vw, 320px)', zIndex: 1101,
        background: 'linear-gradient(160deg, #1e1b4b, #312e81)', boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
        transform: menuOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column', padding: 24, overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <span style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>Menu</span>
          <button onClick={() => setMenuOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 20, width: 38, height: 38, borderRadius: 10, cursor: 'pointer' }}>✕</button>
        </div>

        {user && (
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#1e1b4b' }}>{(user.name || 'U')[0].toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{user.name}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, wordBreak: 'break-all' }}>{user.email}</p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[...navLinks, { to: '/cart', label: 'Cart', icon: '🛒' }, { to: '/wishlist', label: 'Wishlist', icon: '❤️' }, ...(user ? [{ to: '/orders', label: 'My Orders', icon: '📦' }] : []), ...(user?.isAdmin ? [{ to: '/admin', label: 'Admin Panel', icon: '⚙️' }] : [])].map((link) => (
            <Link key={link.to} to={link.to} style={{ color: isActive(link.to) ? '#fbbf24' : 'rgba(255,255,255,0.85)', textDecoration: 'none', padding: '14px 16px', borderRadius: 12, fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 12, background: isActive(link.to) ? 'rgba(251,191,36,0.12)' : 'transparent' }}>
              <span style={{ fontSize: 20 }}>{link.icon}</span>{link.label}
            </Link>
          ))}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 24 }}>
          {user ? (
            <button onClick={handleLogout} style={{ width: '100%', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', padding: 14, borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>🚪 Logout</button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/login" style={{ textAlign: 'center', color: '#fff', textDecoration: 'none', padding: 14, borderRadius: 12, fontWeight: 700, fontSize: 15, border: '1.5px solid rgba(255,255,255,0.25)' }}>Login</Link>
              <Link to="/register" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#1e1b4b', textDecoration: 'none', padding: 14, borderRadius: 12, fontWeight: 800, fontSize: 15 }}>Create Account</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const iconBtn = { position: 'relative', width: 42, height: 42, borderRadius: 10, background: 'rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none', fontSize: 19, alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const badge = { position: 'absolute', top: -3, right: -3, background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', fontSize: 10, fontWeight: 800, minWidth: 18, height: 18, padding: '0 4px', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(239,68,68,0.5)' };
const dropdown = { position: 'absolute', top: '120%', right: 0, background: '#fff', borderRadius: 14, boxShadow: '0 12px 32px rgba(0,0,0,0.18)', minWidth: 210, overflow: 'hidden', border: '1px solid #e2e8f0' };
const dropItem = { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', textDecoration: 'none', color: '#475569', fontWeight: 600, fontSize: 14 };

const css = `
  .nav-desktop { display: flex; }
  .nav-desktop-flex { display: flex; }
  .nav-hamburger { display: none; }
  @media (max-width: 768px) {
    .nav-desktop, .nav-desktop-flex { display: none !important; }
    .nav-hamburger { display: flex !important; }
  }
`;
