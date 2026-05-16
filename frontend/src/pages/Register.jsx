import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';

export default function Register() {
  // ✅ Clearly named — confusion nahi
  const reduxDispatch = useDispatch();
  const routerNavigate = useNavigate();

  const [form,    setForm]    = useState({ name:'', email:'', password:'', confirm:'' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!form.name.trim())               return setError('Full name is required');
    if (!form.email.trim())              return setError('Email is required');
    if (form.password.length < 6)       return setError('Password must be at least 6 characters');
    if (form.password !== form.confirm)  return setError('Passwords do not match');

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:     form.name.trim(),
          email:    form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // ✅ dispatch aur navigate clearly alag hain
      reduxDispatch(setCredentials({
        user:  data.user,
        token: data.token,
      }));

      routerNavigate('/');

    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '11px 16px',
    borderRadius: 11, border: '1.5px solid #e2e8f0',
    fontSize: 14, background: '#f8fafc',
    boxSizing: 'border-box', transition: 'border-color .2s',
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#7c3aed 100%)',
      padding: 16, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%',
        width: '50%', height: '50%',
        background: 'rgba(124,58,237,.15)', borderRadius: '50%', filter: 'blur(80px)',
      }} />

      <div style={{
        background: '#fff', borderRadius: 24,
        padding: '36px 32px', width: '100%', maxWidth: 420,
        position: 'relative', zIndex: 1,
        boxShadow: '0 30px 80px rgba(0,0,0,.35)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'linear-gradient(135deg,#f59e0b,#f97316)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 22, color: '#fff',
            }}>S</div>
            <span style={{ fontWeight: 900, fontSize: 18, color: '#0f172a' }}>
              Sultan <span style={{ color: '#f97316' }}>Elite</span>
            </span>
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>
            Create Account
          </h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>
            Join thousands of happy shoppers
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fef2f2', border: '1.5px solid #fecaca',
            borderRadius: 12, padding: '10px 14px',
            marginBottom: 18, color: '#dc2626',
            fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            ❌ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 'name',     label: 'Full Name',        type: 'text',     ph: 'Muhammad Hasnain'    },
            { key: 'email',    label: 'Email Address',    type: 'email',    ph: 'you@example.com'     },
            { key: 'password', label: 'Password',         type: 'password', ph: 'Min 6 characters'    },
            { key: 'confirm',  label: 'Confirm Password', type: 'password', ph: 'Repeat your password' },
          ].map(field => (
            <div key={field.key}>
              <label style={{
                display: 'block', fontSize: 12,
                fontWeight: 700, color: '#64748b', marginBottom: 5,
              }}>
                {field.label}
              </label>
              <input
                type={field.type}
                value={form[field.key]}
                onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.ph}
                required
                style={inputStyle}
                onFocus={e  => { e.target.style.borderColor = '#2563eb'; }}
                onBlur={e   => { e.target.style.borderColor = '#e2e8f0'; }}
              />
            </div>
          ))}

          <button type="submit" disabled={loading} style={{
            padding: '13px', borderRadius: 12, border: 'none', marginTop: 4,
            background: loading
              ? '#e2e8f0'
              : 'linear-gradient(135deg,#2563eb,#7c3aed)',
            color:      loading ? '#94a3b8' : '#fff',
            fontWeight: 800, fontSize: 15,
            cursor:     loading ? 'not-allowed' : 'pointer',
            boxShadow:  loading ? 'none' : '0 4px 16px rgba(37,99,235,.35)',
            transition: 'all .2s',
          }}>
            {loading ? '⏳ Creating Account...' : '✅ Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563eb', fontWeight: 700 }}>
            Sign In →
          </Link>
        </p>
      </div>
    </div>
  );
}