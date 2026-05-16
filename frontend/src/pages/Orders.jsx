import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';

const STEPS = [
  { key:'pending',    icon:'📋', label:'Order Placed' },
  { key:'processing', icon:'⚙️', label:'Processing'   },
  { key:'shipped',    icon:'🚚', label:'Shipped'      },
  { key:'delivered',  icon:'✅', label:'Delivered'    },
];

const STATUS_STYLE = {
  pending:    { bg:'#fef3c7', color:'#92400e', border:'#fcd34d' },
  processing: { bg:'#dbeafe', color:'#1e40af', border:'#93c5fd' },
  shipped:    { bg:'#ede9fe', color:'#5b21b6', border:'#c4b5fd' },
  delivered:  { bg:'#dcfce7', color:'#166534', border:'#86efac' },
  cancelled:  { bg:'#fee2e2', color:'#991b1b', border:'#fca5a5' },
};

function OrderCard({ order }) {
  const st      = STATUS_STYLE[order.status] || STATUS_STYLE.pending;
  const stepIdx = STEPS.findIndex(s => s.key === order.status);
  const curIdx  = stepIdx === -1 ? 0 : stepIdx;

  const statusIcon  = STEPS.find(s => s.key === order.status)?.icon || '📋';
  const statusLabel = order.status
    ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
    : 'Pending';

  const paidBg    = order.isPaid ? '#dcfce7' : '#fef2f2';
  const paidColor = order.isPaid ? '#166534' : '#dc2626';
  const paidText  = order.isPaid ? '✅ Paid'  : '⏳ Payment Pending';

  const shipColor = order.shippingPrice === 0 ? '#10b981' : '#64748b';
  const shipText  = order.shippingPrice === 0
    ? '🎉 Free Delivery'
    : 'Shipping: PKR ' + (order.shippingPrice || 0).toLocaleString();

  const progressWidth =
    curIdx === 0 ? '0%'   :
    curIdx === 1 ? '33%'  :
    curIdx === 2 ? '66%'  : '100%';

  return (
    <div style={{
      background:'#fff', borderRadius:20,
      border:'1px solid #e2e8f0', overflow:'hidden',
      boxShadow:'0 2px 12px rgba(0,0,0,.05)',
    }}>

      {/* Header */}
      <div style={{
        background:'linear-gradient(135deg,#f8fafc,#f1f5f9)',
        padding:'16px 20px', borderBottom:'1px solid #e2e8f0',
        display:'flex', justifyContent:'space-between',
        flexWrap:'wrap', gap:10, alignItems:'center',
      }}>
        <div>
          <p style={{ fontWeight:800, fontSize:15, color:'#0f172a' }}>
            Order #{(order._id || '').slice(-8).toUpperCase()}
          </p>
          <p style={{ color:'#94a3b8', fontSize:12, marginTop:2 }}>
            Placed on {new Date(order.createdAt).toLocaleDateString('en-PK', {
              day:'numeric', month:'long', year:'numeric',
            })}
          </p>
        </div>
        <span style={{
          background: st.bg,
          color:      st.color,
          border:     '1.5px solid ' + st.border,
          padding:'6px 16px', borderRadius:20,
          fontSize:12, fontWeight:700,
          display:'flex', alignItems:'center', gap:6,
        }}>
          {statusIcon} {statusLabel}
        </span>
      </div>

      {/* Items */}
      <div style={{ padding:'16px 20px' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
          {(order.orderItems || []).map((item, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:14,
              padding:'10px 14px', background:'#f8fafc',
              borderRadius:12, border:'1px solid #f1f5f9',
            }}>
              <div style={{
                width:56, height:56, borderRadius:10,
                overflow:'hidden', flexShrink:0,
                border:'1px solid #e2e8f0', background:'#f1f5f9',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                {item.image
                  ? <img src={item.image} alt={item.name}
                      style={{ width:'100%', height:'100%', objectFit:'cover' }}
                      onError={e => { e.target.style.display = 'none'; }} />
                  : <span style={{ fontSize:24 }}>📦</span>
                }
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:14, color:'#1e293b' }}>
                  {item.name}
                </p>
                <p style={{ color:'#64748b', fontSize:12, marginTop:2 }}>
                  {item.quantity} × PKR {(item.price || 0).toLocaleString()}
                </p>
              </div>
              <p style={{ fontWeight:800, color:'#2563eb', fontSize:15, flexShrink:0 }}>
                PKR {((item.quantity || 1) * (item.price || 0)).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{
          display:'flex', justifyContent:'space-between',
          flexWrap:'wrap', gap:12,
          paddingTop:14, borderTop:'1px solid #f1f5f9',
          alignItems:'flex-end',
        }}>
          <div>
            {order.shippingAddress && order.shippingAddress.city && (
              <div style={{ marginBottom:8 }}>
                <p style={{
                  fontSize:10, fontWeight:700, color:'#94a3b8',
                  textTransform:'uppercase', letterSpacing:.5, marginBottom:4,
                }}>
                  Shipping To
                </p>
                <p style={{ fontSize:13, color:'#334155', fontWeight:600 }}>
                  📍 {order.shippingAddress.address}, {order.shippingAddress.city}
                </p>
                <p style={{ fontSize:12, color:'#64748b' }}>
                  📱 {order.shippingAddress.phone}
                </p>
              </div>
            )}
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <span style={{
                background: paidBg,
                color:      paidColor,
                padding:'3px 10px', borderRadius:20,
                fontSize:11, fontWeight:700,
              }}>
                {paidText}
              </span>
              <span style={{
                background:'#f1f5f9', color:'#475569',
                padding:'3px 10px', borderRadius:20,
                fontSize:11, fontWeight:700,
              }}>
                💳 {order.paymentMethod}
              </span>
            </div>
          </div>

          <div style={{ textAlign:'right' }}>
            <p style={{ fontSize:12, color:shipColor, fontWeight:600, marginBottom:2 }}>
              {shipText}
            </p>
            <p style={{ fontSize:22, fontWeight:900, color:'#2563eb' }}>
              PKR {(order.totalPrice || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div style={{
        padding:'16px 20px 20px',
        borderTop:'1px solid #f1f5f9',
        background:'#fafafa',
      }}>
        <p style={{
          fontSize:10, fontWeight:700, color:'#94a3b8',
          textTransform:'uppercase', letterSpacing:.5, marginBottom:14,
        }}>
          Order Progress
        </p>

        {order.status === 'cancelled' ? (
          <div style={{
            background:'#fee2e2', border:'1px solid #fecaca',
            borderRadius:12, padding:'12px 16px',
            display:'flex', alignItems:'center', gap:10,
          }}>
            <span style={{ fontSize:22 }}>❌</span>
            <div>
              <p style={{ fontWeight:700, color:'#dc2626', fontSize:14 }}>
                Order Cancelled
              </p>
              <p style={{ color:'#94a3b8', fontSize:12 }}>
                This order has been cancelled
              </p>
            </div>
          </div>
        ) : (
          <div style={{ position:'relative' }}>
            {/* Track line */}
            <div style={{
              position:'absolute', top:16,
              left:'10%', right:'10%',
              height:3, background:'#e2e8f0',
              borderRadius:2, zIndex:0,
            }}>
              <div style={{
                height:'100%', borderRadius:2,
                background:'linear-gradient(90deg,#2563eb,#7c3aed)',
                width: progressWidth,
                transition:'width .5s ease',
              }} />
            </div>

            <div style={{
              display:'flex', justifyContent:'space-between',
              position:'relative', zIndex:1,
            }}>
              {STEPS.map((step, idx) => {
                const done    = idx <= curIdx;
                const current = idx === curIdx;

                const dotBg     = done ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : '#fff';
                const dotBorder = done ? 'none' : '2px solid #e2e8f0';
                const dotShadow = current
                  ? '0 0 0 4px rgba(37,99,235,.2)'
                  : done ? '0 2px 8px rgba(37,99,235,.3)' : 'none';
                const lblColor  = done ? '#2563eb' : '#94a3b8';
                const lblWeight = current ? 800 : 600;

                return (
                  <div key={step.key} style={{
                    display:'flex', flexDirection:'column',
                    alignItems:'center', gap:8, flex:1,
                  }}>
                    <div style={{
                      width:34, height:34, borderRadius:'50%',
                      background:  dotBg,
                      border:      dotBorder,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:16,
                      boxShadow:   dotShadow,
                      transition:  'all .3s',
                    }}>
                      {done
                        ? <span>{step.icon}</span>
                        : <span style={{ width:10, height:10, borderRadius:'50%', background:'#cbd5e1', display:'block' }} />
                      }
                    </div>
                    <p style={{
                      fontSize:10, fontWeight:lblWeight,
                      color:lblColor, textAlign:'center', lineHeight:1.3,
                    }}>
                      {step.label}
                    </p>
                    {current && (
                      <span style={{
                        fontSize:9, background:'#eff6ff',
                        color:'#2563eb', padding:'2px 6px',
                        borderRadius:8, fontWeight:700,
                      }}>
                        Current
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Orders() {
  const { user, token }     = useSelector(s => s.auth);
  const nav                 = useNavigate();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    try {
      const res  = await fetch('https://mern-ecommerce-platform-olhz.vercel.app/api/orders/myorders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (!user) { nav('/login'); return; }
    fetchOrders();
  }, [user, nav, fetchOrders]);

  if (loading) return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{
          width:44, height:44, borderRadius:'50%',
          border:'4px solid #2563eb', borderTopColor:'transparent',
          animation:'spin .8s linear infinite', margin:'0 auto 12px',
        }} />
        <p style={{ color:'#64748b' }}>Loading your orders...</p>
        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ background:'#f8fafc', minHeight:'100vh', padding:'32px 0 60px' }}>
      <div className="container">

        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:26, fontWeight:900, color:'#0f172a', marginBottom:4 }}>
            📦 My Orders
          </h1>
          <p style={{ color:'#64748b', fontSize:14 }}>
            Track all your orders in real-time
          </p>
        </div>

        {orders.length === 0 ? (
          <div style={{
            background:'#fff', borderRadius:20,
            border:'1px solid #e2e8f0', padding:'80px 20px', textAlign:'center',
          }}>
            <p style={{ fontSize:72, marginBottom:16 }}>🛍️</p>
            <h2 style={{ fontSize:22, fontWeight:800, color:'#0f172a', marginBottom:8 }}>
              No Orders Yet
            </h2>
            <p style={{ color:'#64748b', marginBottom:28 }}>
              Start shopping and your orders will appear here
            </p>
            <Link to="/shop" style={{
              background:'linear-gradient(135deg,#2563eb,#7c3aed)',
              color:'#fff', padding:'13px 32px', borderRadius:12,
              fontWeight:800, fontSize:15, display:'inline-block',
            }}>
              🛍️ Start Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {orders.map(order => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}