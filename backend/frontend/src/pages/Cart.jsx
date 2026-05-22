import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart, clearCart } from '../store/cartSlice';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { orderAPI } from '../services/api';

export default function Cart() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { items } = useSelector(s => s.cart);
  const { user }  = useSelector(s => s.auth);
  const [placing, setPlacing] = useState(false);
  const [form,    setForm]    = useState({
    address: '', city: '', phone: '', paymentMethod: 'JazzCash',
  });

  const subtotal     = items.reduce((s,i) => s + i.price * i.quantity, 0);
  const shippingCost = subtotal >= 2000 ? 0 : 200;
  const total        = subtotal + shippingCost;

  const handleQty = (item, qty) => {
    if (qty < 1) return dispatch(removeFromCart(item._id));
    dispatch(addToCart({ ...item, quantity: qty }));
  };

  const handlePlaceOrder = async () => {
    if (!user) { navigate('/login'); return; }
    if (!form.address || !form.city || !form.phone) {
      alert('Please fill shipping details');
      return;
    }
    setPlacing(true);
    try {
      const orderData = {
        orderItems: items.map(i => ({
          name:     i.name,
          quantity: i.quantity,
          image:    i.image || i.images?.[0] || '',
          price:    i.price,
          product:  i._id,
        })),
        shippingAddress: { address: form.address, city: form.city, phone: form.phone },
        paymentMethod:   form.paymentMethod,
        itemsPrice:      subtotal,
        shippingPrice:   shippingCost,
        taxPrice:        0,
        totalPrice:      total,
      };
      const res = await orderAPI.create(orderData);
      if (res._id) {
        dispatch(clearCart());
        navigate('/orders');
      }
    } catch (err) { console.error(err); }
    setPlacing(false);
  };

  if (items.length === 0) return (
    <div style={{ textAlign:'center', padding:'80px 20px', minHeight:'60vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
      <p style={{ fontSize:80, marginBottom:16 }}>🛒</p>
      <h2 style={{ fontSize:24, fontWeight:800, color:'#0f172a', marginBottom:8 }}>Your cart is empty</h2>
      <p style={{ color:'#64748b', marginBottom:32 }}>Add some products to get started</p>
      <Link to="/products" style={{
        background:'linear-gradient(135deg,#2563eb,#7c3aed)', color:'#fff',
        padding:'14px 32px', borderRadius:12, fontWeight:800, textDecoration:'none', fontSize:16,
      }}>
        🛍️ Continue Shopping
      </Link>
    </div>
  );

  const inp = {
    width:'100%', padding:'10px 14px', borderRadius:10,
    border:'1.5px solid #e2e8f0', fontSize:14, background:'#fff',
    boxSizing:'border-box',
  };

  return (
    <div style={{ background:'#f8fafc', minHeight:'100vh', padding:'32px 0' }}>
      <div className="container">
        <h1 style={{ fontSize:28, fontWeight:900, color:'#0f172a', marginBottom:24 }}>
          🛒 Shopping Cart ({items.length} items)
        </h1>

        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:24 }} className="cart-grid">

          {/* Cart Items */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {items.map(item => (
              <div key={item._id} style={{
                background:'#fff', borderRadius:16, border:'1px solid #e2e8f0',
                padding:16, display:'flex', gap:16, alignItems:'flex-start',
              }}>
                <img src={item.image||item.images?.[0]||'/placeholder.png'} alt={item.name}
                  style={{ width:90, height:90, objectFit:'cover', borderRadius:12, flexShrink:0, border:'1px solid #e2e8f0' }}
                  onError={e => { e.target.src='/placeholder.png'; }} />

                <div style={{ flex:1, minWidth:0 }}>
                  <Link to={`/product/${item._id}`}
                    style={{ fontWeight:700, fontSize:15, color:'#1e293b', textDecoration:'none', display:'block', marginBottom:4 }}>
                    {item.name}
                  </Link>
                  {item.category && (
                    <span style={{ background:'#eff6ff', color:'#2563eb', padding:'2px 8px', borderRadius:10, fontSize:11, fontWeight:700 }}>
                      {item.category}
                    </span>
                  )}
                  <p style={{ fontWeight:900, color:'#2563eb', fontSize:18, marginTop:8 }}>
                    PKR {item.price?.toLocaleString()}
                  </p>
                </div>

                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:12, flexShrink:0 }}>
                  {/* Qty */}
                  <div style={{ display:'flex', alignItems:'center', gap:0, border:'1.5px solid #e2e8f0', borderRadius:10, overflow:'hidden' }}>
                    <button onClick={() => handleQty(item, item.quantity-1)}
                      style={{ width:36, height:36, border:'none', background:'#f8fafc', fontWeight:800, fontSize:18, cursor:'pointer', color:'#334155' }}>
                      −
                    </button>
                    <span style={{ width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:14, borderLeft:'1px solid #e2e8f0', borderRight:'1px solid #e2e8f0' }}>
                      {item.quantity}
                    </span>
                    <button onClick={() => handleQty(item, item.quantity+1)}
                      style={{ width:36, height:36, border:'none', background:'#f8fafc', fontWeight:800, fontSize:18, cursor:'pointer', color:'#334155' }}>
                      +
                    </button>
                  </div>

                  <p style={{ fontWeight:800, color:'#0f172a', fontSize:16 }}>
                    PKR {(item.price * item.quantity)?.toLocaleString()}
                  </p>

                  <button onClick={() => dispatch(removeFromCart(item._id))}
                    style={{ background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', padding:'6px 12px', borderRadius:8, fontWeight:700, fontSize:12, cursor:'pointer' }}>
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))}

            <button onClick={() => dispatch(clearCart())}
              style={{ alignSelf:'flex-end', background:'none', color:'#64748b', border:'1px solid #e2e8f0', padding:'8px 16px', borderRadius:8, fontSize:13, cursor:'pointer', fontWeight:600 }}>
              Clear Cart
            </button>
          </div>

          {/* Order Summary + Shipping */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Shipping Form */}
            <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e2e8f0', padding:20 }}>
              <h3 style={{ fontSize:16, fontWeight:800, marginBottom:16, color:'#0f172a' }}>📦 Shipping Details</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#64748b', marginBottom:6 }}>Address</label>
                  <input value={form.address} onChange={e => setForm({...form,address:e.target.value})}
                    placeholder="Street address" style={inp} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#64748b', marginBottom:6 }}>City</label>
                    <input value={form.city} onChange={e => setForm({...form,city:e.target.value})}
                      placeholder="City" style={inp} />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#64748b', marginBottom:6 }}>Phone</label>
                    <input value={form.phone} onChange={e => setForm({...form,phone:e.target.value})}
                      placeholder="03XX-XXXXXXX" style={inp} />
                  </div>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#64748b', marginBottom:6 }}>Payment Method</label>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {['JazzCash','EasyPaisa','Cash on Delivery'].map(method => (
                      <button key={method} type="button" onClick={() => setForm({...form,paymentMethod:method})}
                        style={{
                          padding:'8px 14px', borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer',
                          border:'1.5px solid', transition:'all .2s',
                          borderColor: form.paymentMethod===method ? '#2563eb' : '#e2e8f0',
                          background:  form.paymentMethod===method ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : '#fff',
                          color:       form.paymentMethod===method ? '#fff' : '#64748b',
                        }}>
                        {method === 'JazzCash' ? '💳' : method === 'EasyPaisa' ? '📱' : '💵'} {method}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e2e8f0', padding:20 }}>
              <h3 style={{ fontSize:16, fontWeight:800, marginBottom:16, color:'#0f172a' }}>💰 Order Summary</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:14 }}>
                  <span style={{ color:'#64748b' }}>Subtotal ({items.length} items)</span>
                  <span style={{ fontWeight:600 }}>PKR {subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:14 }}>
                  <span style={{ color:'#64748b' }}>Shipping</span>
                  <span style={{ fontWeight:600, color: shippingCost===0 ? '#22c55e' : '#334155' }}>
                    {shippingCost===0 ? '🎉 FREE' : `PKR ${shippingCost}`}
                  </span>
                </div>
                {subtotal < 2000 && (
                  <p style={{ fontSize:11, color:'#f59e0b', background:'#fffbeb', padding:'6px 10px', borderRadius:8 }}>
                    Add PKR {(2000-subtotal).toLocaleString()} more for free delivery!
                  </p>
                )}
                <div style={{ borderTop:'1px solid #e2e8f0', paddingTop:10, display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontWeight:800, fontSize:16 }}>Total</span>
                  <span style={{ fontWeight:900, fontSize:20, color:'#2563eb' }}>PKR {total.toLocaleString()}</span>
                </div>
              </div>
              <button onClick={handlePlaceOrder} disabled={placing}
                style={{
                  width:'100%', padding:'14px', borderRadius:12, border:'none',
                  background: placing ? '#e2e8f0' : 'linear-gradient(135deg,#2563eb,#7c3aed)',
                  color: placing ? '#94a3b8' : '#fff',
                  fontWeight:800, fontSize:15,
                  cursor: placing ? 'not-allowed' : 'pointer',
                  boxShadow: placing ? 'none' : '0 4px 14px rgba(37,99,235,.3)',
                }}>
                {placing ? '⏳ Placing Order...' : '✅ Place Order'}
              </button>
              <Link to="/products" style={{
                display:'block', textAlign:'center', marginTop:12,
                color:'#64748b', fontSize:13, textDecoration:'none', fontWeight:600,
              }}>
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media(min-width:768px){
          .cart-grid{
            grid-template-columns: 1fr 380px !important;
          }
        }
      `}</style>
    </div>
  );
}