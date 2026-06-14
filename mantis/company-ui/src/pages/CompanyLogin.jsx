import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CompanyLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/company/login', form);
      localStorage.setItem('company_token', res.data.token);
      localStorage.setItem('company_info', JSON.stringify(res.data.company));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a14',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1.5rem', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '20%', right: '20%',
        width: '400px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', left: '20%',
        width: '300px', height: '300px',
        background: 'radial-gradient(ellipse, rgba(8,145,178,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: '420px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(167,139,250,0.15)',
        borderRadius: '24px', padding: '2.5rem',
        backdropFilter: 'blur(20px)',
        animation: 'fadeIn 0.4s ease',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🦗</div>
          <h1 style={{
            fontSize: '1.7rem', fontWeight: 800,
            background: 'linear-gradient(135deg, #a78bfa, #67e8f9)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '0.4rem',
          }}>
            Company Sign In
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Access your Mantis Company Portal
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)',
            borderRadius: '10px', padding: '0.75rem 1rem',
            color: '#f87171', fontSize: '0.875rem', marginBottom: '1.25rem',
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.06em', display: 'block', marginBottom: '0.5rem' }}>
              EMAIL ADDRESS
            </label>
            <input
              id="company-login-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="contact@company.com"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(167,139,250,0.2)'}
            />
          </div>

          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.06em', display: 'block', marginBottom: '0.5rem' }}>
              PASSWORD
            </label>
            <input
              id="company-login-password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(167,139,250,0.2)'}
            />
          </div>

          <button
            id="company-login-submit"
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.9rem',
              background: loading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7c3aed, #0891b2)',
              border: 'none', borderRadius: '12px', color: 'white',
              fontWeight: 700, fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif', marginTop: '0.5rem',
              transition: 'opacity 0.2s, transform 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {loading && (
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white',
                animation: 'spin 0.7s linear infinite',
              }} />
            )}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Don't have a company account? </span>
          <Link to="/register" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none', fontSize: '0.875rem' }}>
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '0.8rem 1rem',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(167,139,250,0.2)',
  borderRadius: '10px', color: '#e2e8f0',
  fontSize: '0.95rem', fontFamily: 'Inter, sans-serif',
  outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
};
