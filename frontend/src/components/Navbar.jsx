import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { resetCart } from '../store/cartSlice';  // ✅ FIX

export default function Navbar() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useSelector(s => s.auth);
  const { items } = useSelector(s => s.cart);
  const [mob,    setMob]    = useState(false);
  const [search, setSearch] = useState('');
  const [scroll, setScroll] = useState(false);

  const cartCount = items?.reduce((n,i) => n + i.quantity, 0) || 0;
  const isActive  = (path) => location.pathname === path;

  useEffect(() => {
    const onScroll = () => setScroll(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mob ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mob]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
      setSearch(''); setMob(false);
    }
  };

  const handleLogout = () => {
    dispatch(resetCart());  // ✅ FIX: pehle cart clear karo
    dispatch(logout());
    navigate('/login');
    setMob(false);
  };

  const NAV = [
    { to:'/',       label:'Home'   },
    { to:'/shop',   label:'Shop'   },
    { to:'/cart',   label:'Cart'   },
    { to:'/orders', label:'Orders' },
  ];

  return (
    <>
      <nav style={{
        position:'sticky', top:0, zIndex:200,
        background: scroll ? 'rgba(15,23,42,.97)' : 'linear-gradient(135deg,#0f172a 0%,#1e3a8a 60%,#2563eb 100%)',
        backdropFilter:'blur(12px)',
        boxShadow: scroll ? '0 4px 24px rgba(0,0,0,.4)' : 'none',
        transition:'all .3s ease',
      }}>
        <div className="container" style={{ display:'flex', alignItems:'center', height:64, gap:16 }}>

          {/* Logo */}
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#f59e0b,#f97316)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:18, color:'#fff', boxShadow:'0 2px 10px rgba(245,158,11,.4)' }}>S</div>
            <div style={{ lineHeight:1.1 }}>
              <span style={{ color:'#fff', fontWeight:900, fontSize:18 }}>Sultan</span>
              <span style={{ color:'#fbbf24', fontWeight:900, fontSize:18 }}> Elite</span>
              <div style={{ color:'rgba(255,255,255,.5)', fontSize:9, letterSpacing:.5 }}>PREMIUM STORE</div>
            </div>
          </Link>

          {/* Search Desktop */}
          <form onSubmit={handleSearch} style={{ flex:1, maxWidth:380, display:'none' }} className="srch-desk">
            <div style={{ position:'relative' }}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..."
                style={{ width:'100%', padding:'9px 44px 9px 18px', borderRadius:24, border:'1.5px solid rgba(255,255,255,.2)', background:'rgba(255,255,255,.12)', color:'#fff', fontSize:13, backdropFilter:'blur(8px)' }} />
              <button type="submit" style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'rgba(255,255,255,.7)', fontSize:15, padding:0 }}>🔍</button>
            </div>
          </form>

          {/* Desktop Links */}
          <div style={{ display:'none', alignItems:'center', gap:4 }} className="nav-desk">
            {NAV.map(n => (
              <Link key={n.to} to={n.to} style={{ color:isActive(n.to)?'#fbbf24':'rgba(255,255,255,.8)', fontWeight:isActive(n.to)?700:500, fontSize:14, padding:'6px 12px', borderRadius:8, background:isActive(n.to)?'rgba(255,255,255,.1)':'transparent', transition:'all .2s' }}>{n.label}</Link>
            ))}
            {user?.isAdmin && (
              <Link to="/admin" style={{ color:'#fbbf24', fontWeight:700, fontSize:14, padding:'6px 12px', borderRadius:8, background:'rgba(245,158,11,.15)', border:'1px solid rgba(245,158,11,.3)' }}>⚙️ Admin</Link>
            )}
          </div>

          {/* Right Cart + Auth */}
          <div style={{ display:'none', alignItems:'center', gap:8, marginLeft:'auto' }} className="nav-desk">
            <Link to="/cart" style={{ position:'relative', padding:'6px 10px' }}>
              <span style={{ fontSize:22 }}>🛒</span>
              {cartCount > 0 && (
                <span style={{ position:'absolute', top:0, right:0, background:'#ef4444', color:'#fff', borderRadius:'50%', width:18, height:18, fontSize:10, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}>{cartCount>9?'9+':cartCount}</span>
              )}
            </Link>
            {user ? (
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#f59e0b,#f97316)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:14 }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <button onClick={handleLogout} style={{ background:'rgba(255,255,255,.1)', color:'rgba(255,255,255,.85)', border:'1px solid rgba(255,255,255,.2)', padding:'6px 14px', borderRadius:8, fontSize:13, fontWeight:600 }}>Logout</button>
              </div>
            ) : (
              <div style={{ display:'flex', gap:6 }}>
                <Link to="/login" style={{ color:'rgba(255,255,255,.85)', fontSize:13, fontWeight:600, padding:'7px 14px', borderRadius:8, border:'1px solid rgba(255,255,255,.2)' }}>Login</Link>
                <Link to="/register" style={{ background:'linear-gradient(135deg,#f59e0b,#f97316)', color:'#fff', fontSize:13, fontWeight:700, padding:'7px 14px', borderRadius:8, boxShadow:'0 2px 8px rgba(245,158,11,.4)' }}>Register</Link>
              </div>
            )}
          </div>

          {/* Mobile right */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginLeft:'auto' }} className="nav-mob">
            <Link to="/cart" style={{ position:'relative' }}>
              <span style={{ fontSize:24, color:'#fff' }}>🛒</span>
              {cartCount > 0 && (
                <span style={{ position:'absolute', top:-4, right:-6, background:'#ef4444', color:'#fff', borderRadius:'50%', width:17, height:17, fontSize:9, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}>{cartCount}</span>
              )}
            </Link>
            <button onClick={() => setMob(!mob)} style={{ background:'none', color:'#fff', fontSize:26, padding:4 }}>
              {mob?'✕':'☰'}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div style={{ padding:'0 16px 12px' }} className="srch-mob">
          <form onSubmit={handleSearch}>
            <div style={{ position:'relative' }}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..."
                style={{ width:'100%', padding:'10px 44px 10px 18px', borderRadius:24, border:'none', background:'rgba(255,255,255,.15)', color:'#fff', fontSize:13 }} />
              <button type="submit" style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#fff', fontSize:16 }}>🔍</button>
            </div>
          </form>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mob && (
        <div style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,.6)' }} onClick={() => setMob(false)}>
          <div style={{ position:'absolute', top:0, right:0, bottom:0, width:'78%', maxWidth:320, background:'linear-gradient(180deg,#0f172a 0%,#1e3a8a 100%)', padding:24, overflowY:'auto', boxShadow:'-8px 0 40px rgba(0,0,0,.5)', animation:'fadeIn .2s ease' }} onClick={e=>e.stopPropagation()}>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,#f59e0b,#f97316)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:'#fff' }}>S</div>
                <span style={{ color:'#fff', fontWeight:800 }}>Sultan Elite</span>
              </div>
              <button onClick={() => setMob(false)} style={{ background:'none', color:'rgba(255,255,255,.7)', fontSize:22 }}>✕</button>
            </div>

            {user && (
              <div style={{ background:'rgba(255,255,255,.08)', borderRadius:14, padding:14, marginBottom:20, display:'flex', alignItems:'center', gap:12, border:'1px solid rgba(255,255,255,.1)' }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#f59e0b,#f97316)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:18 }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ color:'#fff', fontWeight:700, fontSize:14 }}>{user.name}</p>
                  <p style={{ color:'rgba(255,255,255,.5)', fontSize:12 }}>{user.email}</p>
                </div>
              </div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
              {[{to:'/',icon:'🏠',label:'Home'},{to:'/shop',icon:'🛍️',label:'Shop'},{to:'/cart',icon:'🛒',label:`Cart${cartCount>0?` (${cartCount})`:''}`},{to:'/orders',icon:'📦',label:'My Orders'}].map(l => (
                <Link key={l.to} to={l.to} onClick={() => setMob(false)} style={{ display:'flex', alignItems:'center', gap:14, color:isActive(l.to)?'#fbbf24':'rgba(255,255,255,.85)', padding:'13px 12px', borderRadius:10, fontSize:15, fontWeight:500, background:isActive(l.to)?'rgba(255,255,255,.08)':'transparent', transition:'all .15s' }}>
                  <span style={{ fontSize:20 }}>{l.icon}</span>{l.label}
                </Link>
              ))}
              {user?.isAdmin && (
                <Link to="/admin" onClick={() => setMob(false)} style={{ display:'flex', alignItems:'center', gap:14, color:'#fbbf24', padding:'13px 12px', borderRadius:10, fontSize:15, fontWeight:700, background:'rgba(245,158,11,.1)', border:'1px solid rgba(245,158,11,.2)', marginTop:4 }}>
                  <span style={{ fontSize:20 }}>⚙️</span>Admin Panel
                </Link>
              )}
            </div>

            <div style={{ marginTop:24 }}>
              {user ? (
                <button onClick={handleLogout} style={{ width:'100%', padding:13, borderRadius:12, background:'rgba(239,68,68,.15)', color:'#fca5a5', border:'1px solid rgba(239,68,68,.3)', fontWeight:700, fontSize:14 }}>🚪 Logout</button>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <Link to="/login" onClick={() => setMob(false)} style={{ display:'block', textAlign:'center', padding:12, background:'rgba(255,255,255,.1)', color:'#fff', border:'1px solid rgba(255,255,255,.2)', borderRadius:12, fontWeight:600 }}>Login</Link>
                  <Link to="/register" onClick={() => setMob(false)} style={{ display:'block', textAlign:'center', padding:12, background:'linear-gradient(135deg,#f59e0b,#f97316)', color:'#fff', borderRadius:12, fontWeight:700 }}>Create Account</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .srch-desk,.nav-desk { display:none !important; }
        .nav-mob,.srch-mob   { display:flex  !important; }
        @media(min-width:768px){
          .srch-desk { display:flex !important; }
          .nav-desk  { display:flex !important; }
          .nav-mob   { display:none !important; }
          .srch-mob  { display:none !important; }
        }
        input::placeholder{ color:rgba(255,255,255,.5); }
      `}</style>
    </>
  );
}