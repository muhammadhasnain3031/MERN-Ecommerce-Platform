import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { clearCart } from '../store/cartSlice';

export default function Checkout() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { items } = useSelector(s => s.cart);
  const { token } = useSelector(s => s.auth);
  const [address, setAddress] = useState('');
  const [phone,   setPhone]   = useState('');
  const [loading, setLoading] = useState(false);

  const total = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

  const handleOrder = async () => {
    if (!address || !phone) return alert('Address aur phone zaroori hai');
    setLoading(true);
    try {
      const orderItems = items.map(i => ({
        product:  i.product._id,
        name:     i.product.name,
        price:    i.product.price,
        quantity: i.quantity,
        image:    i.product.image,
      }));

      await axios.post('https://mern-ecommerce-platform-olhz.vercel.app/api/orders',
        { items: orderItems, totalPrice: total, address, phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      dispatch(clearCart());
      alert('✅ Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      alert(err.response?.data?.message || 'Order failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '0 20px' }}>
      <h2 style={{ marginBottom: '24px' }}>Checkout</h2>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #eee' }}>
        <h3 style={{ marginBottom: '16px', color: '#444', fontSize: '15px' }}>Delivery Details</h3>

        <textarea value={address} onChange={e => setAddress(e.target.value)}
          placeholder="Full delivery address..."
          rows={3}
          style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', marginBottom: '12px', resize: 'vertical', boxSizing: 'border-box' }}
        />
        <input value={phone} onChange={e => setPhone(e.target.value)}
          placeholder="Phone number"
          style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', boxSizing: 'border-box' }}
        />

        <div style={{ borderTop: '1px solid #eee', paddingTop: '16px', marginBottom: '16px' }}>
          {items.map(i => (
            <div key={i.product?._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span>{i.product?.name} × {i.quantity}</span>
              <span>Rs. {(i.product?.price * i.quantity)?.toLocaleString()}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '16px', marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
            <span>Total</span>
            <span style={{ color: '#185FA5' }}>Rs. {total?.toLocaleString()}</span>
          </div>
        </div>

        <button onClick={handleOrder} disabled={loading}
          style={{ width: '100%', padding: '13px', background: '#185FA5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
          {loading ? 'Placing Order...' : '✓ Place Order (Cash on Delivery)'}
        </button>
      </div>
    </div>
  );
}