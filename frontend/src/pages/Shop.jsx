import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';

const CATEGORIES = ['All','Electronics','Clothing','Books','Home','Sports','Beauty','Toys'];

export default function Shop() {
  const dispatch       = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [category,   setCategory]   = useState(searchParams.get('category') || 'All');
  const [sort,       setSort]       = useState('newest');
  const [search,     setSearch]     = useState(searchParams.get('search') || '');
  const [searchInput,setSearchInput]= useState(searchParams.get('search') || '');
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);
  const [addedId,    setAddedId]    = useState(null);
  const [priceRange, setPriceRange] = useState({ min:'', max:'' });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit:12, sort });
      if (category !== 'All') params.set('category', category);
      if (search)             params.set('search',   search);
      if (priceRange.min)     params.set('minPrice', priceRange.min);
      if (priceRange.max)     params.set('maxPrice', priceRange.max);

      const res  = await fetch(`http://localhost:5000/api/products?${params}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.pages  || 1);
      setTotal(data.total       || 0);
    } catch (err) {
      console.error(err);
      setProducts([]);
    }
    setLoading(false);
  }, [page, sort, category, search, priceRange]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ ...product, quantity:1 }));
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 2000);
  };

  const renderStars = (r) =>
    '★'.repeat(Math.round(r||0)) + '☆'.repeat(5-Math.round(r||0));

  return (
    <div style={{ background:'#f8fafc', minHeight:'100vh' }}>
      {/* Header */}
      <div style={{
        background:'linear-gradient(135deg,#1e3a8a,#2563eb)',
        padding:'40px 16px', textAlign:'center',
      }}>
        <h1 style={{ color:'#fff', fontSize:'clamp(24px,4vw,40px)', fontWeight:900, marginBottom:8 }}>
          🛍️ Shop All Products
        </h1>
        <p style={{ color:'rgba(255,255,255,.8)', fontSize:15 }}>
          {total} products available
        </p>
        {/* Search */}
        <form onSubmit={handleSearch}
          style={{ maxWidth:500, margin:'20px auto 0', display:'flex', gap:8 }}>
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
            placeholder="Search products..."
            style={{
              flex:1, padding:'12px 18px', borderRadius:12, border:'none',
              fontSize:14, background:'rgba(255,255,255,.15)',
              color:'#fff', backdropFilter:'blur(10px)',
            }} />
          <button type="submit" style={{
            padding:'12px 20px', borderRadius:12, border:'none',
            background:'linear-gradient(135deg,#f59e0b,#f97316)',
            color:'#fff', fontWeight:700, cursor:'pointer',
          }}>
            🔍 Search
          </button>
        </form>
      </div>

      <div className="container" style={{ padding:'24px 16px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:24 }} className="shop-layout">

          {/* Sidebar Filters */}
          <aside style={{
            background:'#fff', borderRadius:16, border:'1px solid #e2e8f0',
            padding:20, height:'fit-content',
          }}>
            <h3 style={{ fontSize:15, fontWeight:800, marginBottom:16, color:'#0f172a' }}>
              🔧 Filters
            </h3>

            {/* Categories */}
            <div style={{ marginBottom:20 }}>
              <p style={{ fontSize:12, fontWeight:700, color:'#64748b', marginBottom:10, textTransform:'uppercase', letterSpacing:.5 }}>
                Category
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => { setCategory(cat); setPage(1); }}
                    style={{
                      padding:'8px 12px', borderRadius:10, border:'1.5px solid',
                      textAlign:'left', cursor:'pointer', fontSize:13, fontWeight:600,
                      transition:'all .15s',
                      borderColor:  category===cat ? '#2563eb' : '#e2e8f0',
                      background:   category===cat ? '#eff6ff' : '#fff',
                      color:        category===cat ? '#2563eb' : '#475569',
                    }}>
                    {category===cat ? '✓ ' : ''}{cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div style={{ marginBottom:20 }}>
              <p style={{ fontSize:12, fontWeight:700, color:'#64748b', marginBottom:10, textTransform:'uppercase', letterSpacing:.5 }}>
                Price Range (PKR)
              </p>
              <div style={{ display:'flex', gap:8 }}>
                <input type="number" placeholder="Min" value={priceRange.min}
                  onChange={e => setPriceRange(p => ({...p, min:e.target.value}))}
                  style={{ width:'50%', padding:'8px 10px', borderRadius:8, border:'1.5px solid #e2e8f0', fontSize:13 }} />
                <input type="number" placeholder="Max" value={priceRange.max}
                  onChange={e => setPriceRange(p => ({...p, max:e.target.value}))}
                  style={{ width:'50%', padding:'8px 10px', borderRadius:8, border:'1.5px solid #e2e8f0', fontSize:13 }} />
              </div>
              <button onClick={() => { fetchProducts(); setPage(1); }}
                style={{ width:'100%', marginTop:8, padding:'8px', borderRadius:8, border:'none', background:'#2563eb', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                Apply Filter
              </button>
              {(priceRange.min || priceRange.max || category!=='All' || search) && (
                <button onClick={() => {
                  setPriceRange({min:'',max:''}); setCategory('All');
                  setSearch(''); setSearchInput(''); setPage(1);
                }}
                  style={{ width:'100%', marginTop:6, padding:'7px', borderRadius:8, border:'1px solid #e2e8f0', background:'#fff', color:'#64748b', fontWeight:600, fontSize:12, cursor:'pointer' }}>
                  ✕ Clear All Filters
                </button>
              )}
            </div>

            {/* Sort */}
            <div>
              <p style={{ fontSize:12, fontWeight:700, color:'#64748b', marginBottom:10, textTransform:'uppercase', letterSpacing:.5 }}>
                Sort By
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                {[
                  ['newest',    'Newest First'        ],
                  ['price-low', 'Price: Low to High'  ],
                  ['price-high','Price: High to Low'  ],
                  ['rating',    'Top Rated'           ],
                  ['popular',   'Most Popular'        ],
                ].map(([val, label]) => (
                  <button key={val} onClick={() => setSort(val)}
                    style={{
                      padding:'8px 12px', borderRadius:10, border:'1.5px solid',
                      textAlign:'left', cursor:'pointer', fontSize:13, fontWeight:600,
                      borderColor: sort===val ? '#2563eb' : '#e2e8f0',
                      background:  sort===val ? '#eff6ff' : '#fff',
                      color:       sort===val ? '#2563eb' : '#475569',
                    }}>
                    {sort===val ? '✓ ' : ''}{label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div>
            {/* Active Filters */}
            {(category!=='All' || search || priceRange.min || priceRange.max) && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
                <span style={{ fontSize:12, color:'#64748b', fontWeight:600, alignSelf:'center' }}>Active:</span>
                {category!=='All' && (
                  <span style={{ background:'#eff6ff', color:'#2563eb', padding:'4px 10px', borderRadius:20, fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>
                    {category}
                    <button onClick={() => setCategory('All')} style={{ background:'none', border:'none', cursor:'pointer', color:'#2563eb', fontWeight:900, padding:0 }}>✕</button>
                  </span>
                )}
                {search && (
                  <span style={{ background:'#f0fdf4', color:'#166534', padding:'4px 10px', borderRadius:20, fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>
                    "{search}"
                    <button onClick={() => { setSearch(''); setSearchInput(''); }} style={{ background:'none', border:'none', cursor:'pointer', color:'#166534', fontWeight:900, padding:0 }}>✕</button>
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16 }}>
                {Array(8).fill(0).map((_,i) => (
                  <div key={i} style={{ height:280, background:'#e2e8f0', borderRadius:16, animation:'pulse 1.5s ease-in-out infinite' }} />
                ))}
                <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 20px', background:'#fff', borderRadius:20, border:'1px solid #e2e8f0' }}>
                <p style={{ fontSize:60, marginBottom:12 }}>🔍</p>
                <h3 style={{ fontSize:20, fontWeight:800, color:'#334155', marginBottom:8 }}>No products found</h3>
                <p style={{ color:'#64748b' }}>Try different filters or search terms</p>
              </div>
            ) : (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16 }}>
                  {products.map(product => (
                    <Link key={product._id} to={`/product/${product._id}`} style={{ textDecoration:'none' }}>
                      <div style={{
                        background:'#fff', borderRadius:16, border:'1px solid #e2e8f0',
                        overflow:'hidden', display:'flex', flexDirection:'column',
                        transition:'all .25s', cursor:'pointer',
                      }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform  = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow  = '0 12px 32px rgba(0,0,0,.1)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform  = 'none';
                          e.currentTarget.style.boxShadow  = 'none';
                        }}>

                        {/* Image */}
                        <div style={{ position:'relative', paddingTop:'70%', background:'#f8fafc', overflow:'hidden' }}>
                          <img
                            src={product.image || product.images?.[0] || ''}
                            alt={product.name}
                            style={{
                              position:'absolute', inset:0,
                              width:'100%', height:'100%',
                              objectFit:'cover', objectPosition:'center',
                            }}
                            onError={e => {
                              e.target.style.display = 'none';
                              e.target.parentNode.style.background = 'linear-gradient(135deg,#e2e8f0,#f1f5f9)';
                            }}
                          />
                          {product.stock === 0 && (
                            <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                              <span style={{ color:'#fff', fontWeight:800, fontSize:13, background:'#ef4444', padding:'6px 14px', borderRadius:8 }}>Out of Stock</span>
                            </div>
                          )}
                          {product.featured && (
                            <div style={{ position:'absolute', top:8, left:8 }}>
                              <span style={{ background:'linear-gradient(135deg,#f59e0b,#f97316)', color:'#fff', padding:'3px 8px', borderRadius:10, fontSize:10, fontWeight:700 }}>⭐ Featured</span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div style={{ padding:'12px 14px 14px', flex:1, display:'flex', flexDirection:'column' }}>
                          {product.category && (
                            <span style={{ color:'#7c3aed', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:.5, marginBottom:4 }}>
                              {product.category}
                            </span>
                          )}
                          <h3 style={{ fontSize:13, fontWeight:700, color:'#1e293b', marginBottom:6, lineHeight:1.4,
                            display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                            {product.name}
                          </h3>
                          {product.rating > 0 && (
                            <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:6 }}>
                              <span style={{ color:'#f59e0b', fontSize:11 }}>{renderStars(product.rating)}</span>
                              <span style={{ color:'#94a3b8', fontSize:10 }}>({product.numReviews})</span>
                            </div>
                          )}
                          <div style={{ marginTop:'auto' }}>
                            <p style={{ fontSize:17, fontWeight:900, color:'#2563eb', marginBottom:8 }}>
                              PKR {product.price?.toLocaleString()}
                            </p>
                            <button onClick={e => handleAddToCart(e, product)}
                              disabled={product.stock === 0}
                              style={{
                                width:'100%', padding:'9px', border:'none', borderRadius:10,
                                fontWeight:700, fontSize:12,
                                cursor: product.stock===0 ? 'not-allowed' : 'pointer',
                                background: addedId===product._id
                                  ? 'linear-gradient(135deg,#10b981,#059669)'
                                  : product.stock===0 ? '#e2e8f0'
                                  : 'linear-gradient(135deg,#2563eb,#7c3aed)',
                                color: product.stock===0 ? '#94a3b8' : '#fff',
                                transition:'all .2s',
                              }}>
                              {addedId===product._id ? '✅ Added!' : product.stock===0 ? 'Out of Stock' : '🛒 Add to Cart'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:32, flexWrap:'wrap' }}>
                    <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                      style={{ padding:'8px 16px', borderRadius:10, border:'1.5px solid #e2e8f0', background:'#fff', fontWeight:600, fontSize:13, cursor:page===1?'not-allowed':'pointer', opacity:page===1?.5:1 }}>
                      ← Prev
                    </button>
                    {Array.from({length:totalPages},(_,i)=>i+1).filter(p => p===1||p===totalPages||Math.abs(p-page)<=1).map((p,i,arr) => (
                      <span key={p}>
                        {i>0 && arr[i-1]!==p-1 && <span style={{ padding:'8px 4px', color:'#94a3b8' }}>...</span>}
                        <button onClick={() => setPage(p)}
                          style={{
                            padding:'8px 14px', borderRadius:10, border:'1.5px solid', fontWeight:700, fontSize:13, cursor:'pointer',
                            borderColor: page===p?'#2563eb':'#e2e8f0',
                            background:  page===p?'linear-gradient(135deg,#2563eb,#7c3aed)':'#fff',
                            color:       page===p?'#fff':'#334155',
                          }}>
                          {p}
                        </button>
                      </span>
                    ))}
                    <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                      style={{ padding:'8px 16px', borderRadius:10, border:'1.5px solid #e2e8f0', background:'#fff', fontWeight:600, fontSize:13, cursor:page===totalPages?'not-allowed':'pointer', opacity:page===totalPages?.5:1 }}>
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media(min-width:768px){
          .shop-layout{
            grid-template-columns: 220px 1fr !important;
          }
        }
        input::placeholder{ color:rgba(255,255,255,.5); }
      `}</style>
    </div>
  );
}