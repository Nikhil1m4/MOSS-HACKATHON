import { Link, useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '⊞' },
  { path: '/add-product', label: 'Add Product', icon: '+' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const companyInfo = JSON.parse(localStorage.getItem('company_info') || '{}');

  const logout = () => {
    localStorage.removeItem('company_token');
    localStorage.removeItem('company_info');
    navigate('/login');
  };

  return (
    <aside style={{
      width: '260px',
      minHeight: '100vh',
      background: 'rgba(255,255,255,0.03)',
      borderRight: '1px solid rgba(167,139,250,0.12)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid rgba(167,139,250,0.1)',
        display: 'flex', alignItems: 'center', gap: '0.6rem',
      }}>
        <span style={{ fontSize: '1.4rem' }}>🦗</span>
        <div>
          <div style={{
            fontSize: '1.1rem', fontWeight: 800,
            background: 'linear-gradient(135deg, #a78bfa, #67e8f9)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Mantis
          </div>
          <div style={{ color: '#475569', fontSize: '0.7rem', fontWeight: 500 }}>Company Portal</div>
        </div>
      </div>

      {/* Company Badge */}
      {companyInfo.name && (
        <div style={{
          margin: '1rem',
          padding: '0.9rem 1rem',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(8,145,178,0.1))',
          border: '1px solid rgba(167,139,250,0.2)',
          borderRadius: '12px',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #7c3aed, #0891b2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 800, color: 'white',
            marginBottom: '0.5rem',
          }}>
            {companyInfo.name[0].toUpperCase()}
          </div>
          <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.9rem' }}>{companyInfo.name}</div>
          <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '0.15rem' }}>{companyInfo.email}</div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.7rem 0.9rem',
                borderRadius: '10px',
                textDecoration: 'none',
                color: active ? '#e2e8f0' : '#64748b',
                background: active ? 'rgba(167,139,250,0.15)' : 'transparent',
                border: active ? '1px solid rgba(167,139,250,0.2)' : '1px solid transparent',
                fontWeight: active ? 600 : 500,
                fontSize: '0.9rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = '#94a3b8';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#64748b';
                }
              }}
            >
              <span style={{
                width: '28px', height: '28px',
                background: active ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.04)',
                borderRadius: '7px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem', fontWeight: 700,
                color: active ? '#a78bfa' : '#64748b',
              }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '1rem', borderTop: '1px solid rgba(167,139,250,0.1)' }}>
        <button
          id="sidebar-logout"
          onClick={logout}
          style={{
            width: '100%',
            padding: '0.7rem',
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.2)',
            borderRadius: '10px',
            color: '#f87171',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; }}
        >
          ← Sign Out
        </button>
      </div>
    </aside>
  );
}
