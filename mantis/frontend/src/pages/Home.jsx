import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchProducts = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      const params = query ? { search: query } : {};
      const res = await api.get('/products/', { params });
      setProducts(res.data);
    } catch (err) {
      setError('Failed to load products. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(search);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (val === '') fetchProducts('');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(8,145,178,0.1) 100%)',
        borderBottom: '1px solid rgba(167,139,250,0.1)',
        padding: '5rem 1.5rem 4rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '300px',
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', right: '10%',
          width: '300px', height: '300px',
          background: 'radial-gradient(ellipse, rgba(8,145,178,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{
            display: 'inline-block', padding: '0.3rem 1rem',
            background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)',
            borderRadius: '999px', color: '#a78bfa', fontSize: '0.8rem',
            fontWeight: 600, letterSpacing: '0.08em', marginBottom: '1.5rem',
          }}>
            🦗 AI-POWERED PRODUCT SUPPORT
          </span>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: '1.25rem',
            background: 'linear-gradient(135deg, #e2e8f0 0%, #a78bfa 50%, #67e8f9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Smarter Support,<br />Every Product.
          </h1>
          <p style={{
            color: '#94a3b8', fontSize: '1.1rem',
            maxWidth: '520px', margin: '0 auto 2.5rem',
            lineHeight: 1.7,
          }}>
            Chat with an expert AI technician that diagnoses your issue step by step — powered by your product's own manuals.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', maxWidth: '560px', margin: '0 auto' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <svg style={{
                position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                width: '18px', height: '18px', color: '#64748b',
              }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                id="product-search"
                type="text"
                placeholder="Search products, categories…"
                value={search}
                onChange={handleSearchChange}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.75rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(167,139,250,0.25)',
                  borderRadius: '12px',
                  color: '#e2e8f0',
                  fontSize: '0.95rem',
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(167,139,250,0.6)';
                  e.target.style.background = 'rgba(255,255,255,0.09)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(167,139,250,0.25)';
                  e.target.style.background = 'rgba(255,255,255,0.06)';
                }}
              />
            </div>
            <button
              id="search-btn"
              type="submit"
              style={{
                padding: '0.85rem 1.75rem',
                background: 'linear-gradient(135deg, #7c3aed, #0891b2)',
                border: 'none', borderRadius: '12px',
                color: 'white', fontWeight: 700,
                fontSize: '0.95rem', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                transition: 'opacity 0.2s, transform 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.target.style.opacity = '0.88'; e.target.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }}
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Products Section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h2 style={{ color: '#e2e8f0', fontSize: '1.4rem', fontWeight: 700 }}>
            {search ? `Results for "${search}"` : 'All Products'}
          </h2>
          {!loading && (
            <span style={{
              color: '#64748b', fontSize: '0.875rem',
              background: 'rgba(255,255,255,0.04)',
              padding: '0.3rem 0.75rem', borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              {products.length} product{products.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              border: '3px solid rgba(167,139,250,0.15)',
              borderTop: '3px solid #a78bfa',
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        )}

        {error && !loading && (
          <div style={{
            textAlign: 'center', padding: '4rem 2rem',
            color: '#f87171', background: 'rgba(248,113,113,0.05)',
            borderRadius: '16px', border: '1px solid rgba(248,113,113,0.15)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <p style={{ fontSize: '1rem' }}>{error}</p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '5rem 2rem', color: '#64748b',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.5 }}>🔍</div>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>No products found</p>
            <p style={{ fontSize: '0.9rem' }}>
              {search ? 'Try a different search term.' : 'No products have been added yet.'}
            </p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}>
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
