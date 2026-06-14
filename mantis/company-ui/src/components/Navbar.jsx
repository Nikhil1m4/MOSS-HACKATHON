import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/': { title: 'Dashboard', subtitle: 'Manage your products and materials' },
  '/add-product': { title: 'Add New Product', subtitle: 'Register a product to your catalogue' },
};

export default function Navbar() {
  const location = useLocation();
  const page = PAGE_TITLES[location.pathname] || { title: 'Mantis', subtitle: 'Company Portal' };

  return (
    <header style={{
      background: 'rgba(10,10,20,0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(167,139,250,0.1)',
      padding: '0 2rem',
      height: '64px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div>
        <h1 style={{ color: '#e2e8f0', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
          {page.title}
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.75rem', margin: 0 }}>{page.subtitle}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: '#34d399', boxShadow: '0 0 8px #34d399',
        }} />
        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>System Online</span>
      </div>
    </header>
  );
}
