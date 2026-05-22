import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { productAPI } from '../services/api';  // ✅ FIX

export default function ProductDetail() {
  const { id }   = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector(s => s.auth);  // ✅ FIX: token from redux

  const [product,   setProduct]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [qty,       setQty]       = useState(1);
  const [mainImg,   setMainImg]   = useState('');
  const [added,     setAdded]     = useState(false);
  const [activeTab, setActiveTab] = useState('desc');
  const [rating,    setRating]    = useState(5);
  const [comment,   setComment]   = useState('');
  const [reviewing, setReviewing] = useState(false);

  const loadProduct = async () => {
    try {
      const data = await productAPI.getById(id);  // ✅ FIX
      setProduct(data);
      setMainImg(data.image || data.images?.[0] || '/placeholder.png');
    } catch { }
    setLoading(false);
  };

  useEffect(() => { loadProduct(); }, [id]);

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity: qty }));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    dispatch(addToCart({ ...product, quantity: qty }));
    navigate('/cart');
  };

  const handleReview = async () => {
    if (!user) { navigate('/login'); return; }
    setReviewing(true);
    try {
      await productAPI.addReview(id, { rating, comment });  // ✅ FIX
      setComment('');
      await loadProduct();
    } catch (err) { console.error(err); }
    setReviewing(false);
  };

  const renderStars = (r, interactive = false) =>
    [1,2,3,4,5].map(star => (
      <span key={star}
        onClick={() => interactive && setRating(star)}
        style={{ fontSize:interactive?28:16, color:star<=(interactive?rating:r)?'#f59e0b':'#d1d5db', cursor:interactive?'pointer':'default', transition:'color .15s' }}>
        ★
      </span>
    ));

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:400 }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:48, height:48, borderRadius:'50%', border:'4px solid #2563eb', borderTopColor:'transparent', animation:'spin .8s linear infinite', margin:'0 auto 16px' }} />
        <p style={{ color:'#64748b' }}>Loading product...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (!product) return (
    <div style={{ textAlign:'center', padding:80 }}>
      <p style={{ fontSize:60 }}>❌</p>
      <p style={{ fontSize:20, fontWeight:700 }}>Product not found</p>
    </div>
  );

  const images  = product.images?.length ? product.images : product.image ? [product.image] : ['/placeholder.png'];
  const inStock = product.stock > 0;

  return (
    <div style={{ background:'#f8fafc', minHeight:'100vh' }}>
      {/* Breadcrumb */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'12px 0' }}>
        <div className="container" style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#64748b' }}>
          <span style={{ cursor:'pointer', color:'#2563eb' }} onClick={() => navigate('/')}>Home</span>
          <span>›</span>
          <span style={{ cursor:'pointer', color:'#2563eb' }} onClick={() => navigate('/products')}>Products</span>
          <span>›</span>
          <span style={{ color:'#334155', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:200 }}>{product.name}</span>
        </div>
      </div>

      <div className="container" style={{ padding:'32px 16px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:32 }} className="product-detail-grid">

          {/* Images */}
          <div>
            <div style={{ background:'#fff', borderRadius:20, overflow:'hidden', border:'1px solid #e2e8f0', marginBottom:12, position:'relative' }}>
              <div style={{ paddingTop:'80%', position:'relative' }}>
                <img src={mainImg} alt={product.name}
                  style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'contain', padding:24 }}
                  onError={e => { e.target.src='/placeholder.png'; }} />
              </div>
              {product.featured && (
                <div style={{ position:'absolute', top:16, left:16 }}>
                  <span style={{ background:'linear-gradient(135deg,#f59e0b,#f97316)', color:'#fff', padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:700 }}>⭐ Featured</span>
                </div>
              )}
              {!inStock && (
                <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,.8)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ background:'#ef4444', color:'#fff', padding:'10px 24px', borderRadius:12, fontWeight:800, fontSize:18 }}>Out of Stock</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {images.map((img,i) => (
                  <div key={i} onClick={() => setMainImg(img)}
                    style={{ width:72, height:72, borderRadius:12, overflow:'hidden', border:`2px solid ${mainImg===img?'#2563eb':'#e2e8f0'}`, cursor:'pointer', flexShrink:0, background:'#fff' }}>
                    <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{e.target.src='/placeholder.png';}} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
              {product.category && <span style={{ background:'#eff6ff', color:'#2563eb', padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700 }}>{product.category}</span>}
              {product.brand    && <span style={{ background:'#f0fdf4', color:'#166534', padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700 }}>{product.brand}</span>}
            </div>

            <h1 style={{ fontSize:'clamp(22px,3vw,32px)', fontWeight:900, color:'#0f172a', marginBottom:12, lineHeight:1.3 }}>{product.name}</h1>

            {product.rating > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                <div>{renderStars(product.rating)}</div>
                <span style={{ color:'#64748b', fontSize:13 }}>{product.rating?.toFixed(1)} ({product.numReviews} reviews)</span>
              </div>
            )}

            <div style={{ marginBottom:20 }}>
              <p style={{ fontSize:36, fontWeight:900, color:'#2563eb', lineHeight:1 }}>PKR {product.price?.toLocaleString()}</p>
              <p style={{ color:'#64748b', fontSize:13, marginTop:4 }}>Inclusive of all taxes</p>
            </div>

            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'8px 16px', borderRadius:10, marginBottom:24, background:inStock?'#f0fdf4':'#fef2f2', border:`1px solid ${inStock?'#bbf7d0':'#fecaca'}` }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:inStock?'#22c55e':'#ef4444' }} />
              <span style={{ fontSize:13, fontWeight:700, color:inStock?'#166534':'#991b1b' }}>
                {inStock?`In Stock (${product.stock} available)`:'Out of Stock'}
              </span>
            </div>

            {inStock && (
              <div style={{ marginBottom:24 }}>
                <p style={{ fontSize:13, fontWeight:700, color:'#64748b', marginBottom:8 }}>Quantity:</p>
                <div style={{ display:'flex', alignItems:'center', gap:0, width:'fit-content', border:'1.5px solid #e2e8f0', borderRadius:12, overflow:'hidden' }}>
                  <button onClick={() => setQty(q=>Math.max(1,q-1))} style={{ width:44, height:44, border:'none', background:'#f8fafc', fontSize:20, cursor:'pointer', fontWeight:700, color:'#334155' }}>−</button>
                  <span style={{ width:44, height:44, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:16, borderLeft:'1px solid #e2e8f0', borderRight:'1px solid #e2e8f0' }}>{qty}</span>
                  <button onClick={() => setQty(q=>Math.min(product.stock,q+1))} style={{ width:44, height:44, border:'none', background:'#f8fafc', fontSize:20, cursor:'pointer', fontWeight:700, color:'#334155' }}>+</button>
                </div>
              </div>
            )}

            <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:24 }}>
              <button onClick={handleAddToCart} disabled={!inStock}
                style={{ flex:1, minWidth:140, padding:'14px 24px', borderRadius:12, border:'none', fontWeight:800, fontSize:15, cursor:inStock?'pointer':'not-allowed', background:added?'linear-gradient(135deg,#10b981,#059669)':inStock?'linear-gradient(135deg,#2563eb,#7c3aed)':'#e2e8f0', color:inStock?'#fff':'#94a3b8', boxShadow:inStock?'0 4px 14px rgba(37,99,235,.3)':'none', transition:'all .2s' }}>
                {added?'✅ Added to Cart!':'🛒 Add to Cart'}
              </button>
              <button onClick={handleBuyNow} disabled={!inStock}
                style={{ flex:1, minWidth:140, padding:'14px 24px', borderRadius:12, border:'2px solid #2563eb', fontWeight:800, fontSize:15, cursor:inStock?'pointer':'not-allowed', background:'#fff', color:'#2563eb', transition:'all .2s' }}>
                ⚡ Buy Now
              </button>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[['🚚','Free Delivery','On orders above PKR 2000'],['↩️','Easy Returns','7-day return policy'],['🔒','Secure Payment','100% safe & secure'],['💯','Authentic','100% original products']].map(([icon,title,sub]) => (
                <div key={title} style={{ background:'#f8fafc', borderRadius:12, padding:'12px 14px', border:'1px solid #e2e8f0' }}>
                  <p style={{ fontSize:20, marginBottom:4 }}>{icon}</p>
                  <p style={{ fontWeight:700, fontSize:12, color:'#334155' }}>{title}</p>
                  <p style={{ fontSize:11, color:'#94a3b8' }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background:'#fff', borderRadius:20, border:'1px solid #e2e8f0', overflow:'hidden', marginTop:32 }}>
          <div style={{ display:'flex', borderBottom:'1px solid #e2e8f0', overflowX:'auto' }}>
            {[{key:'desc',label:'📋 Description'},{key:'specs',label:'📊 Specifications'},{key:'reviews',label:`⭐ Reviews (${product.numReviews||0})`}].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{ padding:'14px 24px', border:'none', fontWeight:700, fontSize:14, cursor:'pointer', whiteSpace:'nowrap', transition:'all .2s', background:activeTab===tab.key?'#fff':'#f8fafc', color:activeTab===tab.key?'#2563eb':'#64748b', borderBottom:activeTab===tab.key?'2px solid #2563eb':'2px solid transparent' }}>
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ padding:24 }}>
            {activeTab==='desc' && <p style={{ color:'#475569', lineHeight:1.8, fontSize:15 }}>{product.description||'No description available.'}</p>}

            {activeTab==='specs' && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:2 }}>
                {[['Product Name',product.name],['Brand',product.brand||'N/A'],['Category',product.category||'N/A'],['Stock',`${product.stock} units`],['Rating',`${product.rating?.toFixed(1)} / 5`],['Reviews',product.numReviews||0]].map(([k,v],i) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'12px 16px', background:i%2===0?'#f8fafc':'#fff', borderRadius:8 }}>
                    <span style={{ color:'#64748b', fontSize:13, fontWeight:600 }}>{k}</span>
                    <span style={{ color:'#1e293b', fontSize:13, fontWeight:700 }}>{v}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab==='reviews' && (
              <div>
                <div style={{ background:'#f8fafc', borderRadius:16, padding:20, marginBottom:24, border:'1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize:16, fontWeight:800, marginBottom:16, color:'#0f172a' }}>✍️ Write a Review</h3>
                  <div style={{ marginBottom:12 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:'#64748b', marginBottom:6 }}>Your Rating:</p>
                    <div style={{ display:'flex', gap:4 }}>{renderStars(rating,true)}</div>
                  </div>
                  <textarea value={comment} onChange={e=>setComment(e.target.value)}
                    placeholder="Share your experience..." rows={3}
                    style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid #e2e8f0', fontSize:14, resize:'vertical', marginBottom:12, boxSizing:'border-box', lineHeight:1.6 }} />
                  <button onClick={handleReview} disabled={reviewing||!comment.trim()}
                    style={{ padding:'10px 24px', borderRadius:10, border:'none', background:reviewing?'#e2e8f0':'linear-gradient(135deg,#2563eb,#7c3aed)', color:reviewing?'#94a3b8':'#fff', fontWeight:700, fontSize:14, cursor:'pointer' }}>
                    {reviewing?'⏳ Submitting...':'✅ Submit Review'}
                  </button>
                </div>

                {!product.reviews?.length ? (
                  <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>
                    <p style={{ fontSize:40, marginBottom:8 }}>💬</p>
                    <p style={{ fontWeight:600 }}>No reviews yet — be the first!</p>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                    {product.reviews.map((review,i) => (
                      <div key={i} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, padding:20 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, flexWrap:'wrap', gap:8 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#2563eb,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800 }}>
                              {review.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontWeight:700, fontSize:14 }}>{review.name}</p>
                              <div style={{ display:'flex' }}>{renderStars(review.rating)}</div>
                            </div>
                          </div>
                          <p style={{ color:'#94a3b8', fontSize:12 }}>{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                        <p style={{ color:'#475569', fontSize:14, lineHeight:1.7 }}>{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@media(min-width:768px){.product-detail-grid{grid-template-columns:1fr 1fr !important;}}`}</style>
    </div>
  );
}