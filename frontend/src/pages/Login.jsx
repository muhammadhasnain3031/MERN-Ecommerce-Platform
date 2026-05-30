import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setCredentials } from '../store/authSlice';
import { loadUserCart } from '../store/cartSlice';
import { loadUserWishlist } from '../store/wishlistSlice';
import { authAPI } from '../services/api';
import { useToast } from '../components/Toast';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await authAPI.login({ email: form.email.trim().toLowerCase(), password: form.password });
      localStorage.setItem('token', data.token);
      dispatch(setCredentials({ user: data.user, token: data.token }));
      dispatch(loadUserCart());
      dispatch(loadUserWishlist());
      showToast(`Welcome back, ${data.user.name?.split(' ')[0]}!`, 'success');
      navigate(data.user.isAdmin ? '/admin' : '/');
    } catch (err) { setError(err.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{authCss}</style>
      <div style={authWrap}>
        <div style={blob1} /><div style={blob2} />
        <div style={{ width: '100%', maxWidth: 430, position: 'relative', zIndex: 2, animation: 'slideUp 0.6s ease both' }}>
          <div style={{ textAlign: 'center', marginBottom: 26 }}>
            <div style={{ width: 70, height: 70, margin: '0 auto 16px', borderRadius: 20, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, boxShadow: '0 12px 30px rgba(251,191,36,0.4)', animation: 'floatY 3s ease-in-out infinite' }}>🛒</div>
            <h1 style={{ fontSize: 25, fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>Welcome Back!</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14.5, marginTop: 6 }}>Sign in to continue shopping</p>
          </div>
          <div style={card}>
            {error && <div style={errBox}>⚠️ {error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div><label style={label}>Email Address</label><input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required style={input} /></div>
              <div><label style={label}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} placeholder="Enter password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required style={{ ...input, paddingRight: 46 }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={eyeBtn}>{showPass ? '🙈' : '👁️'}</button>
                </div>
              </div>
              <button type="submit" disabled={loading} style={{ ...submitBtn, background: loading ? '#94a3b8' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: loading ? 'none' : '0 10px 24px rgba(99,102,241,0.35)' }}>{loading ? '⏳ Signing in...' : 'Sign In →'}</button>
            </form>
            <div style={{ textAlign: 'center', marginTop: 22, paddingTop: 18, borderTop: '1px solid #f1f5f9' }}><p style={{ fontSize: 14, color: '#64748b' }}>Don't have an account? <Link to="/register" style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>Sign Up</Link></p></div>
          </div>
        </div>
      </div>
    </>
  );
}

const authWrap = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #6d28d9 100%)', padding: 24, position: 'relative', overflow: 'hidden' };
const blob1 = { position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.4), transparent 70%)', animation: 'blob 14s ease-in-out infinite' };
const blob2 = { position: 'absolute', bottom: -120, left: -80, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.4), transparent 70%)', animation: 'blob 18s ease-in-out infinite reverse' };
const card = { background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 24px 60px rgba(0,0,0,0.3)' };
const errBox = { background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: 12, fontSize: 14, fontWeight: 600, marginBottom: 18, animation: 'shake 0.4s ease' };
const label = { display: 'block', fontWeight: 700, fontSize: 13, color: '#475569', marginBottom: 7 };
const input = { width: '100%', padding: '12px 15px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 15, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };
const eyeBtn = { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 17 };
const submitBtn = { color: '#fff', border: 'none', padding: 14, borderRadius: 14, fontWeight: 800, fontSize: 16, cursor: 'pointer', marginTop: 4 };
const authCss = `@keyframes slideUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } } @keyframes blob { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,-40px) scale(1.2); } } @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } } @keyframes floatY { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }`;
