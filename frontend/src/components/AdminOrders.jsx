import { useEffect, useState, useCallback } from 'react';

const STATUS_MAP = {
  pending:    { bg:'#fef3c7', color:'#92400e', border:'#fcd34d', icon:'📋', label:'Pending'    },
  processing: { bg:'#dbeafe', color:'#1e40af', border:'#93c5fd', icon:'⚙️', label:'Processing' },
  shipped:    { bg:'#ede9fe', color:'#5b21b6', border:'#c4b5fd', icon:'🚚', label:'Shipped'    },
  delivered:  { bg:'#dcfce7', color:'#166534', border:'#86efac', icon:'✅', label:'Delivered'  },
  cancelled:  { bg:'#fee2e2', color:'#991b1b', border:'#fca5a5', icon:'❌', label:'Cancelled'  },
};

const FLOW = ['pending','processing','shipped','delivered'];

export default function AdminOrders({ token }) {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');
  const [search,   setSearch]   = useState('');
  const [updating, setUpdating] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      const res  = await fetch('http://localhost:5000/api/orders', {
        headers: { Authorization:`Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch(err) { console.error(err); }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId + newStatus);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method:  'PUT',
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body:    JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o =>
          o._id === orderId
            ? { ...o, status: newStatus, isDelivered: newStatus==='delivered', deliveredAt: newStatus==='delivered'?new Date():o.deliveredAt }
            : o
        ));
      }
    } catch(err) { console.error(err); }
    setUpdating('');
  };

  const filtered = orders.filter(o => {
    const mF = filter==='all' || o.status===filter;
    const mS = !search ||
      o._id?.toLowerCase().includes(search.toLowerCase()) ||
      (o.user?.name||'').toLowerCase().includes(search.toLowerCase()) ||
      (o.user?.email||'').toLowerCase().includes(search.toLowerCase());
    return mF && mS;
  });

  const revenue = orders.filter(o=>o.isPaid).reduce((s,o)=>s+o.totalPrice,0);

  // ── Stats ────────────────────────────────────────────────
  const stats = [
    { icon:'📦', label:'Total Orders',  value: orders.length,                                    bg:'#dbeafe', color:'#1e40af' },
    { icon:'⏳', label:'Pending',       value: orders.filter(o=>o.status==='pending').length,    bg:'#fef3c7', color:'#92400e' },
    { icon:'🚚', label:'Shipped',       value: orders.filter(o=>o.status==='shipped').length,    bg:'#ede9fe', color:'#5b21b6' },
    { icon:'✅', label:'Delivered',     value: orders.filter(o=>o.status==='delivered').length,  bg:'#dcfce7', color:'#166534' },
    { icon:'💰', label:'Revenue (Paid)',value:`PKR ${(revenue/1000).toFixed(1)}K`,               bg:'#f0fdf4', color:'#166534' },
  ];

  return (
    <div>
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12, marginBottom:24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background:s.bg, borderRadius:16, padding:'14px 16px', border:`1px solid ${s.color}25` }}>
            <p style={{ fontSize:26, marginBottom:4 }}>{s.icon}</p>
            <p style={{ fontSize:22, fontWeight:900, color:s.color, lineHeight:1 }}>{s.value}</p>
            <p style={{ fontSize:11, color:s.color, fontWeight:600, opacity:.8, marginTop:4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <input
          value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search by name, email or order ID..."
          style={{ flex:1, minWidth:200, padding:'9px 14px', borderRadius:10, border:'1.5px solid #e2e8f0', fontSize:13 }}
        />
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {['all','pending','processing','shipped','delivered','cancelled'].map(f => (
            <button key={f} onClick={()=>setFilter(f)}
              style={{
                padding:'7px 13px', borderRadius:10, border:'1.5px solid',
                fontSize:12, fontWeight:700, cursor:'pointer', textTransform:'capitalize',
                borderColor: filter===f ? '#2563eb' : '#e2e8f0',
                background:  filter===f ? '#2563eb' : '#fff',
                color:       filter===f ? '#fff'    : '#64748b',
              }}>
              {STATUS_MAP[f]?.icon || '🔍'} {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:60 }}>
          <div style={{ width:40, height:40, borderRadius:'50%', border:'4px solid #2563eb', borderTopColor:'transparent', animation:'spin .8s linear infinite', margin:'0 auto' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:60, background:'#fff', borderRadius:16, border:'1px solid #e2e8f0' }}>
          <p style={{ fontSize:50, marginBottom:12 }}>📭</p>
          <p style={{ fontWeight:700, color:'#334155', fontSize:16 }}>No orders found</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {filtered.map(order => {
            const st      = STATUS_MAP[order.status] || STATUS_MAP.pending;
            const curStep = FLOW.indexOf(order.status);

            return (
              <div key={order._id} style={{ background:'#fff', borderRadius:18, border:'1.5px solid #e2e8f0', overflow:'hidden', boxShadow:'0 2px 10px rgba(0,0,0,.05)' }}>

                {/* Order Header */}
                <div style={{
                  background:'linear-gradient(135deg,#f8fafc,#f1f5f9)',
                  padding:'14px 18px', borderBottom:'1px solid #e2e8f0',
                  display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:10, alignItems:'center',
                }}>
                  <div>
                    <p style={{ fontWeight:800, fontSize:14, color:'#0f172a' }}>
                      #{order._id?.slice(-8).toUpperCase()}
                    </p>
                    <p style={{ fontSize:12, color:'#64748b', marginTop:1 }}>
                      👤 {order.user?.name || 'Customer'} · {order.user?.email || ''}
                    </p>
                    <p style={{ fontSize:11, color:'#94a3b8', marginTop:1 }}>
                      🕐 {new Date(order.createdAt).toLocaleString('en-PK')}
                    </p>
                  </div>

                  <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                    {/* Current Status */}
                    <span style={{
                      background:st.bg, color:st.color,
                      border:`1.5px solid ${st.border}`,
                      padding:'5px 14px', borderRadius:20,
                      fontSize:12, fontWeight:700,
                      display:'flex', alignItems:'center', gap:5,
                    }}>
                      {st.icon} {st.label}
                    </span>

                    {/* Paid Badge */}
                    <span style={{
                      background: order.isPaid?'#dcfce7':'#fef2f2',
                      color:      order.isPaid?'#166534':'#dc2626',
                      border:     `1px solid ${order.isPaid?'#86efac':'#fca5a5'}`,
                      padding:'5px 12px', borderRadius:20, fontSize:11, fontWeight:700,
                    }}>
                      {order.isPaid ? '✅ Paid' : '⏳ Unpaid'}
                    </span>

                    {/* Total */}
                    <span style={{ fontWeight:900, color:'#2563eb', fontSize:17 }}>
                      PKR {order.totalPrice?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Items + Shipping */}
                <div style={{ padding:'14px 18px' }}>

                  {/* Items */}
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
                    {order.orderItems?.map((item,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:8, background:'#f8fafc', borderRadius:10, padding:'6px 10px', border:'1px solid #f1f5f9' }}>
                        {item.image ? (
                          <img src={item.image} alt="" style={{ width:32, height:32, borderRadius:6, objectFit:'cover' }}
                            onError={e=>{e.target.style.display='none';}} />
                        ) : (
                          <span style={{ fontSize:18 }}>📦</span>
                        )}
                        <span style={{ fontSize:12, fontWeight:600, color:'#334155' }}>
                          {item.name?.slice(0,22)}{item.name?.length>22?'...':''} ×{item.quantity}
                        </span>
                        <span style={{ fontSize:12, fontWeight:700, color:'#2563eb' }}>
                          PKR {(item.price*item.quantity)?.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping */}
                  {order.shippingAddress?.city && (
                    <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:12, padding:'10px 14px', background:'#f8fafc', borderRadius:10 }}>
                      <p style={{ fontSize:12, color:'#475569' }}>
                        📍 {order.shippingAddress.address}, {order.shippingAddress.city}
                      </p>
                      <p style={{ fontSize:12, color:'#475569' }}>
                        📱 {order.shippingAddress.phone}
                      </p>
                      <p style={{ fontSize:12, color:'#475569' }}>
                        💳 {order.paymentMethod}
                      </p>
                    </div>
                  )}
                </div>

                {/* ✅ Admin Action Panel */}
                <div style={{ padding:'14px 18px 16px', borderTop:'1px solid #f1f5f9', background:'#fefefe' }}>
                  <p style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:.5, marginBottom:12 }}>
                    🎛️ Update Order Status
                  </p>

                  {order.status === 'cancelled' ? (
                    <div style={{ background:'#fee2e2', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#991b1b', fontWeight:600 }}>
                      ❌ This order has been cancelled — no further updates possible
                    </div>
                  ) : order.status === 'delivered' ? (
                    <div style={{ background:'#dcfce7', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#166534', fontWeight:600 }}>
                      ✅ Order delivered successfully on {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString('en-PK') : 'N/A'}
                    </div>
                  ) : (
                    <div>
                      {/* Next Step Button */}
                      {curStep < FLOW.length - 1 && (
                        <div style={{ marginBottom:10 }}>
                          {(() => {
                            const nextStatus = FLOW[curStep + 1];
                            const nextSt     = STATUS_MAP[nextStatus];
                            const isUpdating = updating === order._id + nextStatus;
                            return (
                              <button
                                onClick={() => updateStatus(order._id, nextStatus)}
                                disabled={!!updating}
                                style={{
                                  padding:'10px 24px', borderRadius:12, border:'none',
                                  background: isUpdating ? '#e2e8f0' : `linear-gradient(135deg,${nextSt.color},${nextSt.color}dd)`,
                                  color: isUpdating ? '#94a3b8' : '#fff',
                                  fontWeight:800, fontSize:14, cursor: updating?'not-allowed':'pointer',
                                  boxShadow: updating?'none':`0 3px 12px ${nextSt.color}40`,
                                  display:'flex', alignItems:'center', gap:8,
                                  transition:'all .2s',
                                }}>
                                {isUpdating ? (
                                  <>⏳ Updating...</>
                                ) : (
                                  <>{nextSt.icon} Mark as {nextSt.label}</>
                                )}
                              </button>
                            );
                          })()}
                        </div>
                      )}

                      {/* All Status Options */}
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                        <span style={{ fontSize:11, color:'#94a3b8', fontWeight:600 }}>Jump to:</span>
                        {FLOW.map(s => {
                          const sm       = STATUS_MAP[s];
                          const isCurrent= order.status === s;
                          const isUpd    = updating === order._id + s;
                          return (
                            <button key={s}
                              onClick={() => !isCurrent && updateStatus(order._id, s)}
                              disabled={isCurrent || !!updating}
                              style={{
                                padding:'5px 12px', borderRadius:9, border:'1.5px solid',
                                fontSize:11, fontWeight:700, cursor: isCurrent||updating?'default':'pointer',
                                borderColor: sm.border,
                                background:  isCurrent ? sm.bg : '#fff',
                                color:       sm.color,
                                opacity:     isCurrent ? 1 : updating ? .5 : .8,
                                transition:  'all .15s',
                              }}
                              onMouseEnter={e=>{if(!isCurrent&&!updating)e.currentTarget.style.background=sm.bg;}}
                              onMouseLeave={e=>{if(!isCurrent)e.currentTarget.style.background='#fff';}}>
                              {isUpd ? '⏳' : sm.icon} {sm.label}
                            </button>
                          );
                        })}
                        {/* Cancel button */}
                        <button
                          onClick={() => updateStatus(order._id, 'cancelled')}
                          disabled={!!updating}
                          style={{
                            padding:'5px 12px', borderRadius:9,
                            border:'1.5px solid #fca5a5',
                            fontSize:11, fontWeight:700,
                            cursor: updating?'not-allowed':'pointer',
                            background:'#fff', color:'#dc2626',
                            opacity: updating?.5:1,
                          }}>
                          ❌ Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}