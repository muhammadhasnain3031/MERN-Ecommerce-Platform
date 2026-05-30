import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addToCart, removeFromCart, clearCart } from '../store/cartSlice';
import { useState } from 'react';
import BASE_URL from '../api';
import { useToast } from '../components/Toast';
import SafeImage from '../components/SafeImage';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { items } = useSelector((s) => s.cart);
  const { user, token } = useSelector((s) => s.auth);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ address: '', city: '', phone: '', paymentMethod: 'Cash on Delivery' });

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingCost = subtotal >= 2000 || subtotal === 0 ? 0 : 200;
  const total = subtotal + shippingCost;

  const updateQty = (item, q) => {
    if (q < 1) { dispatch(removeFromCart(item._id)); return; }
    dispatch(addToCart({ ...item, quantity: q }));
  };

  const handlePlaceOrder = async () => {
    if (!user) { navigate('/login'); return; }
    if (!form.address || !form.city || !form.phone) {
      setError('Please fill all shipping details');
      return;
    }
    setPlacing(true); setError('');
    try {
      const orderData = {
        orderItems: items.map((i) => ({ name: i.name, quantity: i.quantity, image: i.image || i.images?.[0] || '', price: i.price, product: i._id })),
        shippingAddress: { address: form.address, city: form.city, phone: form.phone },
        paymentMethod: form.paymentMethod,
        itemsPrice: subtotal, shippingPrice: shippingCost, taxPrice: 0, totalPrice: total,
      };
      const res = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Order failed');
      if (data._id) { dispatch(clearCart()); showToast('Order placed successfully!', 'success'); navigate('/orders'); }
    } catch (err) { setError(err.message); showToast(err.message, 'error'); }
    setPlacing(false);
  };

  if (items.length === 0) {
    return (
      <><style>{kf}</style>
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #f8fafc, #eef2ff)', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 28, padding: '60px 36px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.06)', animation: 'scaleIn 0.5s ease both', maxWidth: 420 }}>
            <div style={{ width: 110, height: 110, margin: '0 auto 22px', borderRadius: '50%', background: 'linear-gradient(135deg, #eef2ff, #faf5ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 54, animation: 'floatY 3s ease-in-out infinite' }}>🛒</span></div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', marginBottom: 10 }}>Your cart is empty</h2>
            <p style={{ color: '#64748b', fontSize: 15, marginBottom: 26 }}>Looks like you haven't added anything yet</p>
            <button onClick={() => navigate('/shop')} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', padding: '14px 36px', borderRadius: 14, fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 10px 24px rgba(99,102,241,0.35)' }}>🛍️ Start Shopping</button>
          </div>
        </div></>
    );
  }

  return (
    <>
      <style>{kf}</style>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc, #eef2ff)', padding: '32px 0 56px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px' }}>
          <h1 className="cart-title" style={{ fontWeight: 900, color: '#0f172a', marginBottom: 24, letterSpacing: -1, animation: 'fadeDown 0.5s ease both' }}>
            🛒 Shopping Cart <span style={{ fontSize: 17, color: '#94a3b8', fontWeight: 600 }}>({items.length})</span>
          </h1>

          <div className="cart-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 22, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map((item, i) => (
                <div key={item._id} className="cart-item" style={{ background: '#fff', borderRadius: 18, padding: 14, display: 'flex', gap: 14, alignItems: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', animation: `slideIn 0.4s ease ${i * 0.06}s both` }}>
                  <SafeImage src={item.image || item.images?.[0]} alt={item.name} style={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 14, flexShrink: 0, border: '1px solid #f1f5f9' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.category}</span>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '3px 0 7px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</h3>
                    <p style={{ fontSize: 17, fontWeight: 900, color: '#6366f1' }}>PKR {item.price?.toLocaleString()}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 9 }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: 11, overflow: 'hidden' }}>
                      <button onClick={() => updateQty(item, item.quantity - 1)} style={qtyBtn}>−</button>
                      <span style={{ width: 36, textAlign: 'center', fontWeight: 800, fontSize: 14, color: '#1e293b' }}>{item.quantity}</span>
                      <button onClick={() => updateQty(item, item.quantity + 1)} style={qtyBtn}>+</button>
                    </div>
                    <button onClick={() => { dispatch(removeFromCart(item._id)); showToast('Item removed', 'info'); }} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '5px 12px', borderRadius: 9, fontWeight: 700, fontSize: 11.5, cursor: 'pointer' }}>🗑️ Remove</button>
                  </div>
                </div>
              ))}
              <button onClick={() => { dispatch(clearCart()); showToast('Cart cleared', 'info'); }} style={{ alignSelf: 'flex-end', background: 'none', color: '#94a3b8', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: 10, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Clear Cart</button>
            </div>

            <div className="cart-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: '#fff', borderRadius: 20, padding: 22, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>Order Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  <div style={row}><span style={{ color: '#64748b' }}>Subtotal ({items.length})</span><span style={{ fontWeight: 700, color: '#1e293b' }}>PKR {subtotal.toLocaleString()}</span></div>
                  <div style={row}><span style={{ color: '#64748b' }}>Shipping</span><span style={{ fontWeight: 700, color: shippingCost === 0 ? '#10b981' : '#1e293b' }}>{shippingCost === 0 ? 'FREE' : `PKR ${shippingCost}`}</span></div>
                  {subtotal < 2000 && <div style={{ background: '#eff6ff', padding: 11, borderRadius: 10, fontSize: 12, color: '#1e40af', fontWeight: 600 }}>🚚 Add PKR {(2000 - subtotal).toLocaleString()} more for FREE shipping!</div>}
                  <div style={{ borderTop: '2px dashed #e2e8f0', paddingTop: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Total</span><span style={{ fontSize: 22, fontWeight: 900, color: '#6366f1' }}>PKR {total.toLocaleString()}</span></div>
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: 20, padding: 22, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 14 }}>📍 Shipping Details</h3>
                {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 14, animation: 'shake 0.4s ease' }}>⚠️ {error}</div>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  <input placeholder="Full Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} style={input} />
                  <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} style={input} />
                  <input placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={input} />
                  <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} style={input}>
                    <option>Cash on Delivery</option><option>JazzCash</option><option>Easypaisa</option><option>Bank Transfer</option>
                  </select>
                </div>
                <button onClick={handlePlaceOrder} disabled={placing} style={{ width: '100%', marginTop: 16, background: placing ? '#94a3b8' : 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', padding: 15, borderRadius: 14, fontWeight: 800, fontSize: 16, cursor: placing ? 'not-allowed' : 'pointer', boxShadow: placing ? 'none' : '0 10px 24px rgba(16,185,129,0.35)' }}>{placing ? '⏳ Placing Order...' : '✅ Place Order'}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const kf = `
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
  @keyframes fadeDown { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideIn { from { opacity: 0; transform: translateX(18px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes floatY { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
  @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
  .cart-title { font-size: 34px; }
  @media (max-width: 860px) {
    .cart-grid { grid-template-columns: 1fr !important; }
    .cart-sidebar { position: static !important; }
    .cart-title { font-size: 26px; }
  }
`;
const qtyBtn = { width: 34, height: 34, border: 'none', background: 'transparent', fontSize: 17, fontWeight: 800, cursor: 'pointer', color: '#6366f1' };
const row = { display: 'flex', justifyContent: 'space-between', fontSize: 14 };
const input = { width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };
