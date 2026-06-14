import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CompanyRegister() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/company/register', form);
      localStorage.setItem('company_token', res.data.token);
      localStorage.setItem('company_info', JSON.stringify(res.data.company));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
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
        position: 'absolute', top: '15%', left: '10%',
        width: '500px', height: '500px',
        background: 'radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '10%',
        width: '350px', height: '350px',
        background: 'radial-gradient(ellipse, rgba(8,145,178,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: '440px',
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
            Register Your Company
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Start providing AI-powered support for your products
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
          {[
            { id: 'company-name', name: 'name', label: 'COMPANY NAME', type: 'text', placeholder: 'Acme Corp' },
            { id: 'company-email', name: 'email', label: 'EMAIL ADDRESS', type: 'email', placeholder: 'contact@company.com' },
            { id: 'company-password', name: 'password', label: 'PASSWORD', type: 'password', placeholder: 'Min. 6 characters' },
          ].map(field => (
            <div key={field.name}>
              <label style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.06em', display: 'block', marginBottom: '0.5rem' }}>
                {field.label}
              </label>
              <input
                id={field.id}
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                required
                placeholder={field.placeholder}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(167,139,250,0.2)'}
              />
            </div>
          ))}

          <button
            id="company-register-submit"
            type="submit"
            disabled={loading}
            style={btnStyle(loading)}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {loading && <Spinner />}
            {loading ? 'Creating account…' : 'Create Company Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Already registered? </span>
          <Link to="/login" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none', fontSize: '0.875rem' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

const Spinner = () => (
  <div style={{
    width: '16px', height: '16px', borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white',
    animation: 'spin 0.7s linear infinite',
  }} />
);

const inputStyle = {
  width: '100%', padding: '0.8rem 1rem',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(167,139,250,0.2)',
  borderRadius: '10px', color: '#e2e8f0',
  fontSize: '0.95rem', fontFamily: 'Inter, sans-serif',
  outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
};

const btnStyle = (loading) => ({
  width: '100%', padding: '0.9rem',
  background: loading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7c3aed, #0891b2)',
  border: 'none', borderRadius: '12px', color: 'white',
  fontWeight: 700, fontSize: '1rem',
  cursor: loading ? 'not-allowed' : 'pointer',
  fontFamily: 'Inter, sans-serif', marginTop: '0.5rem',
  transition: 'opacity 0.2s, transform 0.15s',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
});
