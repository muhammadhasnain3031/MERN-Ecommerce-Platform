import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';

export default function Login() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const [form,    setForm]    = useState({ email:'', password:'' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res  = await fetch('http://localhost:5000/api/auth/login', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ email: form.email.trim().toLowerCase(), password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      dispatch(setCredentials({ user: data.user, token: data.token }));
      navigate(data.user.isAdmin ? '/admin' : '/');
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#7c3aed 100%)',
      padding:16, position:'relative', overflow:'hidden',
    }}>
      <div style={{ position:'absolute', top:'-20%', right:'-10%', width:'50%', height:'50%', background:'rgba(124,58,237,.15)', borderRadius:'50%', filter:'blur(80px)' }} />
      <div style={{ position:'absolute', bottom:'-20%', left:'-10%', width:'50%', height:'50%', background:'rgba(37,99,235,.15)', borderRadius:'50%', filter:'blur(80px)' }} />

      <div style={{
        background:'rgba(255,255,255,.97)', borderRadius:24, padding:'40px 32px',
        width:'100%', maxWidth:420, position:'relative', zIndex:1,
        boxShadow:'0 30px 80px rgba(0,0,0,.3)',
        animation:'fadeIn .3s ease',
      }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <div style={{ width:52, height:52, borderRadius:14, background:'linear-gradient(135deg,#f59e0b,#f97316)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:24, color:'#fff' }}>S</div>
            <span style={{ fontWeight:900, fontSize:20, color:'#0f172a' }}>Sultan <span style={{ color:'#f97316' }}>Elite</span></span>
          </Link>
          <h1 style={{ fontSize:24, fontWeight:900, color:'#0f172a', marginBottom:4 }}>Welcome Back!</h1>
          <p style={{ color:'#64748b', fontSize:14 }}>Sign in to continue shopping</p>
        </div>

        {error && (
          <div style={{ background:'#fef2f2', border:'1.5px solid #fecaca', borderRadius:12, padding:'10px 14px', marginBottom:20, color:'#dc2626', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:8 }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {[
            { key:'email',    label:'Email Address', type:'email',    ph:'you@example.com' },
            { key:'password', label:'Password',      type:'password', ph:'Enter your password' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#64748b', marginBottom:6 }}>{f.label}</label>
              <input type={f.type} value={form[f.key]}
                onChange={e => setForm({...form,[f.key]:e.target.value})}
                placeholder={f.ph} required
                style={{ width:'100%', padding:'12px 16px', borderRadius:12, border:'1.5px solid #e2e8f0', fontSize:14, background:'#f8fafc', boxSizing:'border-box', transition:'border-color .2s' }}
                onFocus={e => e.target.style.borderColor='#2563eb'}
                onBlur={e => e.target.style.borderColor='#e2e8f0'}
              />
            </div>
          ))}
          <button type="submit" disabled={loading}
            style={{
              padding:'13px', borderRadius:12, border:'none', marginTop:4,
              background: loading ? '#e2e8f0' : 'linear-gradient(135deg,#2563eb,#7c3aed)',
              color: loading ? '#94a3b8' : '#fff',
              fontWeight:800, fontSize:15, cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,.35)',
              transition:'all .2s',
            }}>
            {loading ? '⏳ Signing in...' : '🔐 Sign In'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:24, fontSize:14, color:'#64748b' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color:'#2563eb', fontWeight:700 }}>Create Account →</Link>
        </p>
      </div>
    </div>
  );
}