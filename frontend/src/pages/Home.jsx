import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%2394a3b8' font-size='40'%3E📦%3C/text%3E%3C/svg%3E";

const CATEGORIES = [
  { name:'Electronics', icon:'📱', color:'#dbeafe', text:'#1e40af' },
  { name:'Clothing',    icon:'👕', color:'#fce7f3', text:'#9d174d' },
  { name:'Books',       icon:'📚', color:'#d1fae5', text:'#065f46' },
  { name:'Home',        icon:'🏠', color:'#fef3c7', text:'#92400e' },
  { name:'Sports',      icon:'⚽', color:'#ede9fe', text:'#5b21b6' },
  { name:'Beauty',      icon:'💄', color:'#ffedd5', text:'#9a3412' },
];

function ProductCard({ product }) {
  const dispatch = useDispatch();
  const [added, setAdded]   = useState(false);
  const [hover, setHover]   = useState(false);
  const [imgSrc, setImgSrc] = useState(product.image || product.images?.[0] || '');

  const handleAdd = (e) => {
    e.preventDefault(); e.stopPropagation();
    dispatch(addToCart({ ...product, quantity:1 }));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Link to={`/product/${product._id}`} style={{ textDecoration:'none' }}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          background:'#fff', borderRadius:18, border:'1px solid #e2e8f0',
          overflow:'hidden', display:'flex', flexDirection:'column',
          transform:  hover ? 'translateY(-6px)' : 'none',
          boxShadow:  hover ? '0 20px 40px rgba(0,0,0,.1)' : '0 2px 8px rgba(0,0,0,.05)',
          transition: 'all .3s ease',
        }}>

        {/* Image */}
        <div style={{ position:'relative', paddingTop:'72%', background:'#f8fafc', overflow:'hidden' }}>
          {imgSrc ? (
            <img src={imgSrc} alt={product.name}
              style={{
                position:'absolute', inset:0, width:'100%', height:'100%',
                objectFit:'cover',
                transform: hover ? 'scale(1.06)' : 'scale(1)',
                transition:'transform .4s ease',
              }}
              onError={() => setImgSrc('')}
            />
          ) : (
            <div style={{
              position:'absolute', inset:0, display:'flex', alignItems:'center',
              justifyContent:'center', background:'linear-gradient(135deg,#f1f5f9,#e2e8f0)',
            }}>
              <span style={{ fontSize:48, opacity:.4 }}>📦</span>
            </div>
          )}

          {/* Badges */}
          <div style={{ position:'absolute', top:10, left:10, display:'flex', flexDirection:'column', gap:4 }}>
            {product.featured && (
              <span style={{ background:'linear-gradient(135deg,#f59e0b,#f97316)', color:'#fff', padding:'3px 9px', borderRadius:20, fontSize:10, fontWeight:700 }}>⭐ Featured</span>
            )}
            {product.stock === 0 && (
              <span style={{ background:'rgba(239,68,68,.9)', color:'#fff', padding:'3px 9px', borderRadius:20, fontSize:10, fontWeight:700 }}>Out of Stock</span>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <span style={{ background:'rgba(245,158,11,.9)', color:'#fff', padding:'3px 9px', borderRadius:20, fontSize:10, fontWeight:700 }}>Only {product.stock} left!</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div style={{ padding:'14px 14px 16px', flex:1, display:'flex', flexDirection:'column' }}>
          {product.category && (
            <span style={{ color:'#7c3aed', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:.6, marginBottom:5 }}>
              {product.category}
            </span>
          )}
          <h3 style={{
            fontSize:14, fontWeight:700, color:'#1e293b', lineHeight:1.4, marginBottom:6,
            display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden',
          }}>
            {product.name}
          </h3>
          {product.rating > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:8 }}>
              <span style={{ color:'#f59e0b', fontSize:12 }}>
                {'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5-Math.round(product.rating))}
              </span>
              <span style={{ color:'#94a3b8', fontSize:11 }}>({product.numReviews})</span>
            </div>
          )}
          <div style={{ marginTop:'auto' }}>
            <p style={{ fontSize:19, fontWeight:900, color:'#2563eb', marginBottom:10 }}>
              PKR {product.price?.toLocaleString()}
            </p>
            <button onClick={handleAdd} disabled={product.stock === 0}
              style={{
                width:'100%', padding:'10px', borderRadius:12, border:'none',
                fontWeight:700, fontSize:13,
                cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                background: added
                  ? 'linear-gradient(135deg,#10b981,#059669)'
                  : product.stock === 0 ? '#e2e8f0'
                  : 'linear-gradient(135deg,#2563eb,#7c3aed)',
                color:      product.stock === 0 ? '#94a3b8' : '#fff',
                boxShadow:  product.stock > 0 && !added ? '0 3px 10px rgba(37,99,235,.3)' : 'none',
                transition: 'all .2s',
              }}>
              {added ? '✅ Added to Cart!' : product.stock === 0 ? '❌ Out of Stock' : '🛒 Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const navigate  = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [latest,   setLatest]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      const [f, l] = await Promise.all([
        fetch('http://localhost:5000/api/products?featured=true&limit=8').then(r => r.json()),
        fetch('http://localhost:5000/api/products?limit=8&sort=newest').then(r => r.json()),
      ]);
      setFeatured(f.products || []);
      setLatest(l.products   || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div>

      {/* ── Hero ── */}
      <section style={{
        background: 'linear-gradient(135deg,#0f172a 0%,#1e3a8a 45%,#2563eb 75%,#7c3aed 100%)',
        minHeight: 560, position:'relative', overflow:'hidden',
        display:'flex', alignItems:'center',
      }}>
        {/* Decorative circles */}
        {[['-100px','-100px','500px','rgba(124,58,237,.15)'],['-80px','auto','-80px','400px','rgba(37,99,235,.15)']].map(([top,right,bottom,size,bg],i) => (
          <div key={i} style={{ position:'absolute', top, right, bottom, width:size, height:size, background:bg, borderRadius:'50%', filter:'blur(80px)', pointerEvents:'none' }} />
        ))}
        <div style={{ position:'absolute', top:'-80px', right:'-80px', width:'400px', height:'400px', background:'rgba(124,58,237,.12)', borderRadius:'50%', filter:'blur(80px)' }} />
        <div style={{ position:'absolute', bottom:'-80px', left:'-80px', width:'350px', height:'350px', background:'rgba(37,99,235,.12)', borderRadius:'50%', filter:'blur(80px)' }} />

        <div className="container" style={{ position:'relative', zIndex:1, padding:'60px 16px' }}>
          <div style={{ maxWidth:580 }}>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:8,
              background:'rgba(245,158,11,.15)', border:'1px solid rgba(245,158,11,.3)',
              borderRadius:24, padding:'5px 16px', marginBottom:20,
            }}>
              <span>🔥</span>
              <span style={{ color:'#fbbf24', fontSize:12, fontWeight:700 }}>New Arrivals Every Week · Free Delivery on PKR 2000+</span>
            </div>

            <h1 style={{
              fontSize:'clamp(30px,5.5vw,60px)', fontWeight:900, color:'#fff',
              lineHeight:1.15, marginBottom:18,
            }}>
              Pakistan's Most{' '}
              <span style={{ background:'linear-gradient(135deg,#f59e0b,#f97316)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                Trusted
              </span>
              <br />Online Store
            </h1>

            <p style={{ color:'rgba(255,255,255,.7)', fontSize:16, lineHeight:1.8, marginBottom:32, maxWidth:460 }}>
              Shop the latest electronics, fashion, books and more. Authentic products, best prices, fast delivery.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} style={{ display:'flex', gap:8, marginBottom:32, maxWidth:460 }}>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search for products..."
                style={{
                  flex:1, padding:'13px 20px', borderRadius:14,
                  border:'1.5px solid rgba(255,255,255,.2)',
                  background:'rgba(255,255,255,.12)',
                  color:'#fff', fontSize:14, backdropFilter:'blur(10px)',
                }} />
              <button type="submit" style={{
                padding:'13px 22px', borderRadius:14, border:'none',
                background:'linear-gradient(135deg,#f59e0b,#f97316)',
                color:'#fff', fontWeight:800, fontSize:14,
                boxShadow:'0 4px 14px rgba(245,158,11,.4)',
              }}>Search</button>
            </form>

            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <Link to="/shop" style={{
                background:'linear-gradient(135deg,#f59e0b,#f97316)',
                color:'#fff', padding:'13px 28px', borderRadius:13,
                fontWeight:800, fontSize:15,
                boxShadow:'0 4px 18px rgba(245,158,11,.4)',
              }}>
                🛍️ Shop Now
              </Link>
              <Link to="/shop?category=Electronics" style={{
                background:'rgba(255,255,255,.12)',
                border:'1.5px solid rgba(255,255,255,.25)',
                color:'#fff', padding:'13px 28px', borderRadius:13,
                fontWeight:700, fontSize:15,
                backdropFilter:'blur(10px)',
              }}>
                View Deals →
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display:'flex', gap:28, marginTop:36, flexWrap:'wrap' }}>
              {[['500+','Products'],['50k+','Customers'],['100%','Authentic'],['Fast','Delivery']].map(([v,l]) => (
                <div key={l}>
                  <p style={{ color:'#fff', fontWeight:900, fontSize:22, lineHeight:1 }}>{v}</p>
                  <p style={{ color:'rgba(255,255,255,.5)', fontSize:12, marginTop:2 }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Strip ── */}
      <section style={{ background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'16px 0' }}>
        <div className="container">
          <div style={{ display:'flex', justifyContent:'space-around', flexWrap:'wrap', gap:12 }}>
            {[
              ['🚚','Free Delivery','On orders PKR 2000+'],
              ['✅','100% Authentic','Verified products'],
              ['↩️','Easy Returns','7-day return'],
              ['🔒','Secure Payment','Safe & encrypted'],
              ['📞','24/7 Support','Always available'],
            ].map(([icon,title,sub]) => (
              <div key={title} style={{ display:'flex', alignItems:'center', gap:10, padding:'4px 8px' }}>
                <span style={{ fontSize:22 }}>{icon}</span>
                <div>
                  <p style={{ fontWeight:700, fontSize:13, color:'#1e293b' }}>{title}</p>
                  <p style={{ fontSize:11, color:'#94a3b8' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section style={{ padding:'48px 0' }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <p style={{ color:'#7c3aed', fontWeight:700, fontSize:12, textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>Browse By</p>
            <h2 style={{ fontSize:'clamp(22px,3vw,32px)', fontWeight:900, color:'#0f172a' }}>Popular Categories</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12 }}>
            {CATEGORIES.map(cat => (
              <Link key={cat.name} to={`/shop?category=${cat.name}`} style={{ textDecoration:'none' }}>
                <div style={{
                  background: cat.color,
                  borderRadius:16, padding:'20px 16px', textAlign:'center',
                  transition:'all .2s', cursor:'pointer',
                  border:`1px solid ${cat.text}20`,
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform  = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow  = '0 8px 24px rgba(0,0,0,.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                  <p style={{ fontSize:32, marginBottom:8 }}>{cat.icon}</p>
                  <p style={{ fontWeight:700, fontSize:13, color:cat.text }}>{cat.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      {!loading && featured.length > 0 && (
        <section style={{ padding:'0 0 48px', background:'#f8fafc' }}>
          <div className="container">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
              <div>
                <p style={{ color:'#f59e0b', fontWeight:700, fontSize:12, textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Hand-picked</p>
                <h2 style={{ fontSize:'clamp(20px,3vw,28px)', fontWeight:900, color:'#0f172a' }}>⭐ Featured Products</h2>
              </div>
              <Link to="/shop?featured=true" style={{
                color:'#2563eb', fontWeight:700, fontSize:14,
                border:'1.5px solid #2563eb', padding:'8px 18px', borderRadius:10,
              }}>View All →</Link>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:18 }}>
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Latest Products ── */}
      <section style={{ padding:'48px 0 60px' }}>
        <div className="container">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
            <div>
              <p style={{ color:'#7c3aed', fontWeight:700, fontSize:12, textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Fresh in store</p>
              <h2 style={{ fontSize:'clamp(20px,3vw,28px)', fontWeight:900, color:'#0f172a' }}>🆕 Latest Products</h2>
            </div>
            <Link to="/shop" style={{
              color:'#2563eb', fontWeight:700, fontSize:14,
              border:'1.5px solid #2563eb', padding:'8px 18px', borderRadius:10,
            }}>Shop All →</Link>
          </div>

          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:18 }}>
              {Array(8).fill(0).map((_,i) => (
                <div key={i} style={{ height:300, background:'#e2e8f0', borderRadius:18, animation:'shimmer 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          ) : latest.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'#94a3b8' }}>
              <p style={{ fontSize:50, marginBottom:12 }}>📦</p>
              <p style={{ fontWeight:700, fontSize:18 }}>No products yet</p>
              <p style={{ fontSize:14, marginTop:4 }}>Check back soon for new arrivals!</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:18 }}>
              {latest.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          <div style={{ textAlign:'center', marginTop:36 }}>
            <Link to="/shop" style={{
              display:'inline-flex', alignItems:'center', gap:8,
              background:'linear-gradient(135deg,#2563eb,#7c3aed)',
              color:'#fff', padding:'14px 36px', borderRadius:14,
              fontWeight:800, fontSize:15,
              boxShadow:'0 4px 16px rgba(37,99,235,.3)',
            }}>
              🛍️ View All Products →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Banner ── */}
      <section style={{
        background:'linear-gradient(135deg,#1e3a8a,#7c3aed)',
        padding:'48px 24px', textAlign:'center',
      }}>
        <div className="container">
          <h2 style={{ color:'#fff', fontSize:'clamp(20px,4vw,36px)', fontWeight:900, marginBottom:12 }}>
            🎁 Get Free Delivery Today!
          </h2>
          <p style={{ color:'rgba(255,255,255,.75)', fontSize:16, marginBottom:28 }}>
            Order above PKR 2,000 and enjoy free nationwide delivery
          </p>
          <Link to="/shop" style={{
            background:'linear-gradient(135deg,#f59e0b,#f97316)',
            color:'#fff', padding:'14px 36px', borderRadius:14,
            fontWeight:800, fontSize:16,
            boxShadow:'0 4px 18px rgba(245,158,11,.4)',
            display:'inline-block',
          }}>
            Start Shopping →
          </Link>
        </div>
      </section>
    </div>
  );
}