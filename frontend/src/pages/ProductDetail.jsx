import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { toggleWishlist } from '../store/wishlistSlice';
import { productAPI } from '../services/api';
import { useToast } from '../components/Toast';
import SafeImage from '../components/SafeImage';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const wishlist = useSelector((s) => s.wishlist?.items || []);
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [mainImg, setMainImg] = useState('');
  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState('desc');

  const inWishlist = product && wishlist.some((i) => i._id === product._id);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productAPI.getById(id);
      setProduct(data);
      setMainImg(data.image || data.images?.[0] || '');
      // Related products (same category)
      const rel = await productAPI.getAll(`category=${data.category}&limit=5`);
      setRelated((rel.products || []).filter((p) => p._id !== data._id).slice(0, 4));
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchProduct(); window.scrollTo(0, 0); }, [fetchProduct]);

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity: qty }));
    setAdded(true);
    showToast(`${product.name.slice(0, 24)} added to cart`, 'cart');
    setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = () => { dispatch(addToCart({ ...product, quantity: qty })); navigate('/cart'); };
  const handleWishlist = () => { dispatch(toggleWishlist(product)); showToast(inWishlist ? 'Removed from wishlist' : 'Added to wishlist', 'heart'); };

  if (loading) {
    return (
      <><style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #f8fafc, #eef2ff)' }}>
          <div style={{ textAlign: 'center' }}><div style={{ width: 54, height: 54, margin: '0 auto 18px', border: '4px solid #e0e7ff', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} /><p style={{ color: '#64748b', fontWeight: 600 }}>Loading product...</p></div>
        </div></>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #f8fafc, #eef2ff)' }}>
        <div style={{ textAlign: 'center' }}><div style={{ fontSize: 60, marginBottom: 16 }}>😕</div><h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', marginBottom: 16 }}>Product not found</h2><button onClick={() => navigate('/shop')} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', padding: '12px 26px', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>Back to Shop</button></div>
      </div>
    );
  }

  const images = product.images?.length ? product.images : product.image ? [product.image] : [];
  const inStock = product.stock > 0;
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc, #eef2ff)', padding: '24px 0 56px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 13.5, color: '#64748b', flexWrap: 'wrap', animation: 'fadeIn 0.4s ease both' }}>
            <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link><span>/</span>
            <Link to="/shop" style={{ color: '#64748b', textDecoration: 'none' }}>Shop</Link><span>/</span>
            <span style={{ color: '#6366f1', fontWeight: 600 }}>{product.name}</span>
          </div>

          <div className="pd-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, alignItems: 'start' }}>
            {/* IMAGES */}
            <div style={{ animation: 'fadeIn 0.5s ease both' }}>
              <div style={{ background: '#fff', borderRadius: 22, padding: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                <div style={{ borderRadius: 16, overflow: 'hidden', background: '#f8fafc', position: 'relative', paddingTop: '100%' }}>
                  <SafeImage src={mainImg} alt={product.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  {product.featured && <span style={{ position: 'absolute', top: 14, left: 14, background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '6px 14px', borderRadius: 100 }}>⭐ FEATURED</span>}
                  {discount > 0 && <span style={{ position: 'absolute', top: 14, right: 14, background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', fontSize: 13, fontWeight: 800, padding: '6px 12px', borderRadius: 100 }}>-{discount}%</span>}
                </div>
                {images.length > 1 && (
                  <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                    {images.map((img, i) => (
                      <button key={i} onClick={() => setMainImg(img)} style={{ width: 64, height: 64, borderRadius: 12, overflow: 'hidden', border: mainImg === img ? '2.5px solid #6366f1' : '2px solid #e2e8f0', cursor: 'pointer', padding: 0, background: '#f8fafc' }}>
                        <SafeImage src={img} alt={`View ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* INFO */}
            <div style={{ animation: 'slideRight 0.5s ease 0.1s both' }}>
              <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, color: '#6366f1', background: '#eef2ff', padding: '5px 14px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>{product.category}</span>
              <h1 className="pd-title" style={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.2, marginBottom: 14, letterSpacing: -0.5 }}>{product.name}</h1>
              {product.rating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span style={{ color: '#f59e0b', fontSize: 18 }}>{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
                  <span style={{ fontSize: 14, color: '#64748b' }}>{product.rating.toFixed(1)} ({product.numReviews || 0} reviews)</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
                <span className="pd-price" style={{ fontWeight: 900, color: '#6366f1' }}>PKR {product.price?.toLocaleString()}</span>
                {product.oldPrice && <span style={{ fontSize: 19, color: '#cbd5e1', textDecoration: 'line-through' }}>PKR {product.oldPrice.toLocaleString()}</span>}
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: inStock ? '#ecfdf5' : '#fef2f2', color: inStock ? '#059669' : '#dc2626', padding: '8px 16px', borderRadius: 12, fontSize: 14, fontWeight: 700, marginBottom: 22 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: inStock ? '#10b981' : '#ef4444' }} />
                {inStock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </div>
              {product.brand && <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}><strong style={{ color: '#475569' }}>Brand:</strong> {product.brand}</p>}

              {inStock && (
                <div style={{ background: '#fff', borderRadius: 20, padding: 22, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: 22 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: '#475569' }}>Quantity:</span>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: 12, overflow: 'hidden' }}>
                      <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={qtyBtn}>−</button>
                      <span style={{ width: 48, textAlign: 'center', fontWeight: 800, fontSize: 16 }}>{qty}</span>
                      <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} style={qtyBtn}>+</button>
                    </div>
                  </div>
                  <div className="pd-actions" style={{ display: 'flex', gap: 10 }}>
                    <button onClick={handleAddToCart} style={{ flex: 1, background: added ? 'linear-gradient(135deg, #10b981, #059669)' : '#fff', color: added ? '#fff' : '#6366f1', border: '2px solid #6366f1', padding: 14, borderRadius: 14, fontWeight: 800, fontSize: 14.5, cursor: 'pointer', transition: 'all 0.25s', whiteSpace: 'nowrap' }}>{added ? '✓ Added!' : '🛒 Add to Cart'}</button>
                    <button onClick={handleBuyNow} style={{ flex: 1, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', padding: 14, borderRadius: 14, fontWeight: 800, fontSize: 14.5, cursor: 'pointer', boxShadow: '0 8px 20px rgba(99,102,241,0.35)', whiteSpace: 'nowrap' }}>⚡ Buy Now</button>
                    <button onClick={handleWishlist} style={{ width: 52, background: inWishlist ? 'linear-gradient(135deg, #ec4899, #db2777)' : '#fff', border: inWishlist ? 'none' : '2px solid #e2e8f0', borderRadius: 14, fontSize: 20, cursor: 'pointer', flexShrink: 0 }} title="Wishlist">{inWishlist ? '❤️' : '🤍'}</button>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 22 }}>
                {[{ i: '🚚', t: 'Free Delivery' }, { i: '🔒', t: 'Secure Pay' }, { i: '↩️', t: 'Easy Returns' }].map((b) => (
                  <div key={b.t} style={{ background: '#fff', borderRadius: 14, padding: '12px 8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}><div style={{ fontSize: 20, marginBottom: 4 }}>{b.i}</div><p style={{ fontSize: 10.5, fontWeight: 700, color: '#475569' }}>{b.t}</p></div>
                ))}
              </div>

              <div style={{ background: '#fff', borderRadius: 20, padding: 22, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
                  {[{ k: 'desc', l: '📝 Description' }, { k: 'details', l: 'ℹ️ Details' }].map((t) => (
                    <button key={t.k} onClick={() => setTab(t.k)} style={{ background: 'none', border: 'none', padding: '8px 4px', fontWeight: 700, fontSize: 14, cursor: 'pointer', color: tab === t.k ? '#6366f1' : '#94a3b8', borderBottom: tab === t.k ? '2px solid #6366f1' : '2px solid transparent', marginBottom: -1 }}>{t.l}</button>
                  ))}
                </div>
                {tab === 'desc' ? (
                  <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.7 }}>{product.description || 'No description available.'}</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[{ l: 'Category', v: product.category }, { l: 'Brand', v: product.brand || 'N/A' }, { l: 'Stock', v: `${product.stock} units` }, { l: 'Product ID', v: product._id.slice(-8).toUpperCase() }].map((d) => (
                      <div key={d.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f8fafc' }}><span style={{ fontSize: 13.5, color: '#94a3b8', fontWeight: 600 }}>{d.l}</span><span style={{ fontSize: 13.5, color: '#1e293b', fontWeight: 700 }}>{d.v}</span></div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RELATED PRODUCTS */}
          {related.length > 0 && (
            <section style={{ marginTop: 56 }}>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', marginBottom: 24, letterSpacing: -0.5 }}>🔗 Related Products</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 18 }}>
                {related.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

const qtyBtn = { width: 40, height: 40, border: 'none', background: 'transparent', fontSize: 20, fontWeight: 800, cursor: 'pointer', color: '#6366f1' };
const css = `
  @keyframes fadeIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideRight { from { opacity: 0; transform: translateX(22px); } to { opacity: 1; transform: translateX(0); } }
  .pd-title { font-size: 32px; }
  .pd-price { font-size: 36px; }
  @media (max-width: 860px) {
    .pd-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
    .pd-title { font-size: 24px; }
    .pd-price { font-size: 30px; }
  }
  @media (max-width: 480px) {
    .pd-actions { flex-wrap: wrap; }
  }
`;
