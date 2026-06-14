import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=400&q=80',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80',
];

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const companyInfo = JSON.parse(localStorage.getItem('company_info') || '{}');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get('/products/company/mine');
        setProducts(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('company_token');
          localStorage.removeItem('company_info');
          navigate('/login');
        } else {
          setError('Failed to load products.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [navigate]);

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/products/${productId}`);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete product.');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a14' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Products', value: products.length, color: '#a78bfa', icon: '📦' },
              { label: 'Company', value: companyInfo.name || '—', color: '#67e8f9', icon: '🏢' },
              { label: 'Status', value: 'Active', color: '#34d399', icon: '✅' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '16px', padding: '1.25rem',
                display: 'flex', alignItems: 'center', gap: '1rem',
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: `rgba(167,139,250,0.1)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem',
                }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                    {stat.label.toUpperCase()}
                  </div>
                  <div style={{ color: stat.color, fontSize: '1.2rem', fontWeight: 800, marginTop: '0.2rem' }}>
                    {stat.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#e2e8f0', fontSize: '1.1rem', fontWeight: 700 }}>Your Products</h2>
            <button
              id="add-product-btn"
              onClick={() => navigate('/add-product')}
              style={{
                padding: '0.65rem 1.4rem',
                background: 'linear-gradient(135deg, #7c3aed, #0891b2)',
                border: 'none', borderRadius: '10px',
                color: 'white', fontWeight: 700,
                fontSize: '0.875rem', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                transition: 'opacity 0.2s, transform 0.15s',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              + Add New Product
            </button>
          </div>

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                border: '3px solid rgba(167,139,250,0.15)',
                borderTop: '3px solid #a78bfa',
                animation: 'spin 0.8s linear infinite',
              }} />
            </div>
          )}

          {error && !loading && (
            <div style={{
              padding: '3rem', textAlign: 'center',
              color: '#f87171', background: 'rgba(248,113,113,0.05)',
              borderRadius: '16px', border: '1px solid rgba(248,113,113,0.15)',
            }}>
              ⚠️ {error}
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '6rem 2rem',
              background: 'rgba(255,255,255,0.02)',
              border: '2px dashed rgba(167,139,250,0.15)',
              borderRadius: '20px',
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>📦</div>
              <h3 style={{ color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>No Products Yet</h3>
              <p style={{ color: '#475569', fontSize: '0.875rem', marginBottom: '2rem' }}>
                Add your first product to start providing AI support to your customers.
              </p>
              <button
                onClick={() => navigate('/add-product')}
                style={{
                  padding: '0.8rem 2rem',
                  background: 'linear-gradient(135deg, #7c3aed, #0891b2)',
                  border: 'none', borderRadius: '12px',
                  color: 'white', fontWeight: 700,
                  fontSize: '0.95rem', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                + Add First Product
              </button>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.25rem',
            }}>
              {products.map(product => (
                <ProductDashCard
                  key={product.id}
                  product={product}
                  onUpload={() => navigate(`/upload/${product.id}`)}
                  onDelete={() => handleDeleteProduct(product.id, product.name)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function ProductDashCard({ product, onUpload, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const imgSrc = (!imgError && product.image_url)
    ? product.image_url
    : PLACEHOLDER_IMAGES[product.id % PLACEHOLDER_IMAGES.length];

  return (
    <div
      style={{
        background: hovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
        border: hovered ? '1px solid rgba(167,139,250,0.35)' : '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px', overflow: 'hidden',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 16px 48px rgba(124,58,237,0.15)' : '0 4px 16px rgba(0,0,0,0.2)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={imgSrc}
          alt={product.name}
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,20,0.7) 0%, transparent 60%)' }} />
        <span style={{
          position: 'absolute', top: '10px', right: '10px',
          padding: '0.2rem 0.6rem',
          background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.25)',
          color: '#a78bfa', borderRadius: '999px',
          fontSize: '0.68rem', fontWeight: 700,
          backdropFilter: 'blur(8px)',
        }}>
          {product.category}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: '1.1rem' }}>
        <h3 style={{ color: '#e2e8f0', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.4rem' }}>{product.name}</h3>
        {product.description && (
          <p style={{
            color: '#64748b', fontSize: '0.8rem', lineHeight: 1.6,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            marginBottom: '1rem',
          }}>
            {product.description}
          </p>
        )}

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            id={`upload-btn-${product.id}`}
            onClick={onUpload}
            style={{
              flex: 2, padding: '0.6rem',
              background: 'linear-gradient(135deg, #7c3aed, #0891b2)',
              border: 'none', borderRadius: '8px',
              color: 'white', fontWeight: 600,
              fontSize: '0.8rem', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            📁 Upload
          </button>
          <a
            id={`view-product-${product.id}`}
            href={`http://localhost:5173/product/${product.id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1, padding: '0.6rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#94a3b8', fontWeight: 600,
              fontSize: '0.8rem', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              textDecoration: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#e2e8f0'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            👁 View
          </a>
          <button
            onClick={onDelete}
            style={{
              flex: 1, padding: '0.6rem',
              background: 'rgba(248,113,113,0.05)',
              border: '1px solid rgba(248,113,113,0.15)',
              borderRadius: '8px',
              color: '#f87171', fontWeight: 600,
              fontSize: '0.8rem', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.15)'; e.currentTarget.style.color = '#fecaca'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.05)'; e.currentTarget.style.color = '#f87171'; }}
          >
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  );
}
