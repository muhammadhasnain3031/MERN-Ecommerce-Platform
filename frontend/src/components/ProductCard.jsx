import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { toggleWishlist } from '../store/wishlistSlice';
import { useToast } from './Toast';
import SafeImage from './SafeImage';
import { fmtPrice } from '../theme';

export default function ProductCard({ product, index = 0 }) {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const wishlist = useSelector((s) => s.wishlist?.items || []);
  const [hover, setHover] = useState(false);
  const [added, setAdded] = useState(false);
  const inWishlist = wishlist.some((i) => i._id === product._id);
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  const addCart = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (product.stock === 0) return;
    dispatch(addToCart({ ...product, quantity: 1 }));
    setAdded(true);
    showToast(`${product.name.slice(0, 22)} added to cart`, 'cart');
    setTimeout(() => setAdded(false), 1500);
  };
  const wish = (e) => {
    e.preventDefault(); e.stopPropagation();
    dispatch(toggleWishlist(product));
    showToast(inWishlist ? 'Removed from wishlist' : 'Added to wishlist', 'heart');
  };

  return (
    <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', animation: `cardIn 0.45s ease ${0.05 * (index % 10)}s both` }}>
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', transform: hover ? 'translateY(-8px)' : 'none', boxShadow: hover ? '0 24px 48px rgba(99,102,241,0.18)' : '0 2px 12px rgba(0,0,0,0.05)', transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div style={{ position: 'relative', paddingTop: '92%', background: '#f8fafc', overflow: 'hidden' }}>
          <SafeImage src={product.image || product.images?.[0]} alt={product.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.45s ease', transform: hover ? 'scale(1.08)' : 'scale(1)' }} />
          {product.featured && <span style={{ position: 'absolute', top: 10, left: 10, background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 100 }}>⭐ FEATURED</span>}
          {discount > 0 && <span style={{ position: 'absolute', top: 10, right: 10, background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 9px', borderRadius: 100 }}>-{discount}%</span>}
          <button onClick={wish} style={{ position: 'absolute', bottom: 10, right: 10, width: 38, height: 38, borderRadius: '50%', border: 'none', background: inWishlist ? 'linear-gradient(135deg, #ec4899, #db2777)' : 'rgba(255,255,255,0.95)', cursor: 'pointer', fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', transition: 'all 0.2s', opacity: hover || inWishlist ? 1 : 0 }}>{inWishlist ? '❤️' : '🤍'}</button>
          {product.stock === 0 && <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ background: '#fff', color: '#ef4444', fontWeight: 800, padding: '7px 16px', borderRadius: 100, fontSize: 12 }}>Out of Stock</span></div>}
        </div>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>{product.category}</span>
          <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#1e293b', marginBottom: 8, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 40 }}>{product.name}</h3>
          {product.rating > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}><span style={{ color: '#f59e0b', fontSize: 12 }}>{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span><span style={{ fontSize: 11, color: '#94a3b8' }}>({product.numReviews || 0})</span></div>}
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
            <div>
              {product.oldPrice && <p style={{ fontSize: 11.5, color: '#cbd5e1', textDecoration: 'line-through' }}>{fmtPrice(product.oldPrice)}</p>}
              <p style={{ fontSize: 18, fontWeight: 900, color: '#6366f1' }}>{fmtPrice(product.price)}</p>
            </div>
            <button onClick={addCart} disabled={product.stock === 0} style={{ width: 42, height: 42, borderRadius: 13, border: 'none', cursor: product.stock === 0 ? 'not-allowed' : 'pointer', background: added ? 'linear-gradient(135deg, #10b981, #059669)' : product.stock === 0 ? '#e2e8f0' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 17, transition: 'all 0.25s', transform: added ? 'scale(1.12)' : 'scale(1)' }}>{added ? '✓' : '🛒'}</button>
          </div>
        </div>
      </div>
    </Link>
  );
}
