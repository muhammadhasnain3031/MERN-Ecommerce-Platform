import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromWishlist, clearWishlist } from '../store/wishlistSlice';
import { addToCart } from '../store/cartSlice';
import { useToast } from '../components/Toast';
import SafeImage from '../components/SafeImage';

export default function Wishlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const items = useSelector((s) => s.wishlist?.items || []);

  const moveToCart = (item) => {
    dispatch(addToCart({ ...item, quantity: 1 }));
    dispatch(removeFromWishlist(item._id));
    showToast('Moved to cart', 'cart');
  };

  if (items.length === 0) {
    return (
      <><style>{`@keyframes floatY { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } } @keyframes scaleIn { from { opacity:0; transform:scale(0.92);} to {opacity:1; transform:scale(1);} }`}</style>
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #f8fafc, #eef2ff)', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 28, padding: '60px 36px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.06)', animation: 'scaleIn 0.5s ease both', maxWidth: 420 }}>
            <div style={{ width: 110, height: 110, margin: '0 auto 22px', borderRadius: '50%', background: 'linear-gradient(135deg, #fce7f3, #faf5ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 54, animation: 'floatY 3s ease-in-out infinite' }}>❤️</span></div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', marginBottom: 10 }}>Your wishlist is empty</h2>
            <p style={{ color: '#64748b', fontSize: 15, marginBottom: 26 }}>Save items you love for later</p>
            <button onClick={() => navigate('/shop')} style={{ background: 'linear-gradient(135deg, #ec4899, #db2777)', color: '#fff', border: 'none', padding: '14px 36px', borderRadius: 14, fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 10px 24px rgba(236,72,153,0.35)' }}>🛍️ Browse Products</button>
          </div>
        </div></>
    );
  }

  return (
    <>
      <style>{`@keyframes cardIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } @keyframes fadeDown { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } } .wl-title { font-size: 34px; } @media (max-width: 768px) { .wl-title { font-size: 26px; } }`}</style>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc, #eef2ff)', padding: '32px 0 56px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12, animation: 'fadeDown 0.5s ease both' }}>
            <h1 className="wl-title" style={{ fontWeight: 900, color: '#0f172a', letterSpacing: -1 }}>❤️ My Wishlist <span style={{ fontSize: 17, color: '#94a3b8', fontWeight: 600 }}>({items.length})</span></h1>
            <button onClick={() => { dispatch(clearWishlist()); showToast('Wishlist cleared', 'info'); }} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '9px 18px', borderRadius: 11, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Clear All</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map((item, i) => (
              <div key={item._id} style={{ background: '#fff', borderRadius: 18, padding: 14, display: 'flex', gap: 14, alignItems: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', animation: `cardIn 0.4s ease ${i * 0.06}s both`, flexWrap: 'wrap' }}>
                <SafeImage src={item.image || item.images?.[0]} alt={item.name} style={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 14, flexShrink: 0, border: '1px solid #f1f5f9', cursor: 'pointer' }} onClick={() => navigate(`/product/${item._id}`)} />
                <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.category}</span>
                  <h3 onClick={() => navigate(`/product/${item._id}`)} style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '3px 0 7px', cursor: 'pointer' }}>{item.name}</h3>
                  <p style={{ fontSize: 17, fontWeight: 900, color: '#6366f1' }}>PKR {item.price?.toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', gap: 9 }}>
                  <button onClick={() => moveToCart(item)} disabled={item.stock === 0} style={{ background: item.stock === 0 ? '#e2e8f0' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 11, fontWeight: 700, fontSize: 13, cursor: item.stock === 0 ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>{item.stock === 0 ? 'Out of Stock' : '🛒 Move to Cart'}</button>
                  <button onClick={() => { dispatch(removeFromWishlist(item._id)); showToast('Removed from wishlist', 'info'); }} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', width: 42, borderRadius: 11, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
