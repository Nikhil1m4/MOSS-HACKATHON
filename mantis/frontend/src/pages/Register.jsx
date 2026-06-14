import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/user/register', form);
      localStorage.setItem('user_token', res.data.token);
      localStorage.setItem('user_info', JSON.stringify(res.data.user));
      window.dispatchEvent(new Event('auth-change'));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '10%', right: '15%',
        width: '400px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(8,145,178,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', left: '15%',
        width: '300px', height: '300px',
        background: 'radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: '420px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(167,139,250,0.15)',
        borderRadius: '24px',
        padding: '2.5rem',
        position: 'relative',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🦗</div>
          <h1 style={{
            fontSize: '1.6rem', fontWeight: 800,
            background: 'linear-gradient(135deg, #a78bfa, #67e8f9)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '0.4rem',
          }}>
            Create Account
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Join Mantis to get AI-powered product support
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(248,113,113,0.1)',
            border: '1px solid rgba(248,113,113,0.25)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            color: '#f87171',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
              FULL NAME
            </label>
            <input
              id="register-name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Your name"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(167,139,250,0.2)'}
            />
          </div>

          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
              EMAIL ADDRESS
            </label>
            <input
              id="register-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(167,139,250,0.2)'}
            />
          </div>

          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
              PASSWORD
            </label>
            <input
              id="register-password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Min. 6 characters"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(167,139,250,0.2)'}
            />
          </div>

          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.9rem',
              background: loading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7c3aed, #0891b2)',
              border: 'none', borderRadius: '12px',
              color: 'white', fontWeight: 700,
              fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif',
              marginTop: '0.5rem',
              transition: 'opacity 0.2s, transform 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {loading && (
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                animation: 'spin 0.7s linear infinite',
              }} />
            )}
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div style={{
          textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Already have an account?{' '}
          </span>
          <Link to="/login" style={{
            color: '#a78bfa', fontWeight: 600,
            textDecoration: 'none', fontSize: '0.875rem',
          }}
            onMouseEnter={e => e.target.style.textDecoration = 'underline'}
            onMouseLeave={e => e.target.style.textDecoration = 'none'}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.8rem 1rem',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(167,139,250,0.2)',
  borderRadius: '10px',
  color: '#e2e8f0',
  fontSize: '0.95rem',
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};
