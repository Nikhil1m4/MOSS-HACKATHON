import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const MantisLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="14" fill="url(#logoGrad)" opacity="0.2"/>
    <ellipse cx="16" cy="20" rx="4" ry="7" fill="url(#logoGrad)" opacity="0.8"/>
    <ellipse cx="16" cy="10" rx="3" ry="4" fill="url(#logoGrad)"/>
    <line x1="16" y1="8" x2="13" y2="4" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="16" y1="8" x2="19" y2="4" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="14" y1="16" x2="7" y2="13" stroke="#67e8f9" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="14" y1="18" x2="6" y2="18" stroke="#67e8f9" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="18" y1="16" x2="25" y2="13" stroke="#67e8f9" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="18" y1="18" x2="26" y2="18" stroke="#67e8f9" strokeWidth="1.5" strokeLinecap="round"/>
    <defs>
      <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32">
        <stop offset="0%" stopColor="#a78bfa"/>
        <stop offset="100%" stopColor="#67e8f9"/>
      </linearGradient>
    </defs>
  </svg>
);

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const info = localStorage.getItem('user_info');
    if (info) setUser(JSON.parse(info));
    const handleStorage = () => {
      const info = localStorage.getItem('user_info');
      setUser(info ? JSON.parse(info) : null);
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('auth-change', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('auth-change', handleStorage);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_info');
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
    navigate('/');
  };

  return (
    <nav style={{
      background: 'rgba(15,15,26,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(167,139,250,0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <MantisLogo />
          <span style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(135deg, #a78bfa, #67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Mantis</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 500 }}
            onMouseEnter={e => e.target.style.color = '#a78bfa'}
            onMouseLeave={e => e.target.style.color = '#94a3b8'}>
            Home
          </Link>
          {user ? (
            <>
              <span style={{ color: '#a78bfa', fontWeight: 600 }}>Hi, {user.name}</span>
              <button onClick={logout} style={{
                background: 'rgba(167,139,250,0.15)', color: '#a78bfa',
                border: '1px solid rgba(167,139,250,0.3)', borderRadius: '8px',
                padding: '0.4rem 1rem', cursor: 'pointer', fontWeight: 600,
                fontFamily: 'Inter, sans-serif', transition: 'all 0.2s'
              }}
                onMouseEnter={e => e.target.style.background = 'rgba(167,139,250,0.3)'}
                onMouseLeave={e => e.target.style.background = 'rgba(167,139,250,0.15)'}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 500 }}
                onMouseEnter={e => e.target.style.color = '#a78bfa'}
                onMouseLeave={e => e.target.style.color = '#94a3b8'}>
                Login
              </Link>
              <Link to="/register" style={{
                background: 'linear-gradient(135deg, #7c3aed, #0891b2)', color: 'white',
                textDecoration: 'none', fontWeight: 600, padding: '0.4rem 1.2rem',
                borderRadius: '8px', transition: 'opacity 0.2s'
              }}
                onMouseEnter={e => e.target.style.opacity = '0.85'}
                onMouseLeave={e => e.target.style.opacity = '1'}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
