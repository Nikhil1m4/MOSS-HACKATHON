import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import ChatWindow from '../components/ChatWindow';

const FILE_TYPE_ICONS = {
  pdf:   { icon: '📄', color: '#f87171', label: 'PDF Manual' },
  image: { icon: '🖼️', color: '#34d399', label: 'Image' },
  link:  { icon: '🔗', color: '#60a5fa', label: 'Link' },
  video: { icon: '🎬', color: '#fbbf24', label: 'Video' },
};

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, docsRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/products/${id}/documents`),
        ]);
        setProduct(prodRes.data);
        setDocuments(docsRes.data);
      } catch (err) {
        setError('Product not found or server unavailable.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          border: '3px solid rgba(167,139,250,0.15)',
          borderTop: '3px solid #a78bfa',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '600px', margin: '6rem auto', textAlign: 'center', padding: '0 1.5rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>😕</div>
        <h2 style={{ color: '#f87171', marginBottom: '0.75rem' }}>Oops!</h2>
        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>{error}</p>
        <Link to="/" style={{
          padding: '0.7rem 1.5rem',
          background: 'linear-gradient(135deg, #7c3aed, #0891b2)',
          color: 'white', textDecoration: 'none',
          borderRadius: '10px', fontWeight: 600,
        }}>
          ← Back to Products
        </Link>
      </div>
    );
  }

  if (!product) return null;

  const imgSrc = product.image_url || `https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80`;

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a' }}>
      {/* Hero Banner */}
      <div style={{
        position: 'relative', height: '320px', overflow: 'hidden',
      }}>
        <img
          src={imgSrc}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80'; }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(15,15,26,0.3) 0%, rgba(15,15,26,0.95) 100%)',
        }} />
        <div style={{ position: 'absolute', bottom: '2rem', left: 0, right: 0, maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          <Link to="/" style={{
            color: '#64748b', textDecoration: 'none', fontSize: '0.8rem',
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            marginBottom: '0.75rem',
            transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.target.style.color = '#a78bfa'}
            onMouseLeave={e => e.target.style.color = '#64748b'}
          >
            ← All Products
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <h1 style={{
              color: '#f1f5f9', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
              fontWeight: 800, margin: 0,
            }}>
              {product.name}
            </h1>
            <span style={{
              padding: '0.25rem 0.9rem',
              background: 'rgba(167,139,250,0.15)',
              border: '1px solid rgba(167,139,250,0.3)',
              color: '#a78bfa', borderRadius: '999px',
              fontSize: '0.8rem', fontWeight: 700,
            }}>
              {product.category}
            </span>
          </div>
          {product.company && (
            <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontSize: '0.9rem', margin: '0.5rem 0 0' }}>
              by <span style={{ color: '#a78bfa', fontWeight: 600 }}>{product.company.name}</span>
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Left: Info + Docs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Description */}
            {product.description && (
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '16px',
                padding: '1.5rem',
              }}>
                <h2 style={{ color: '#a78bfa', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                  ABOUT THIS PRODUCT
                </h2>
                <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.8, margin: 0 }}>
                  {product.description}
                </p>
              </div>
            )}

            {/* Documents */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              padding: '1.5rem',
            }}>
              <h2 style={{ color: '#a78bfa', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '1rem' }}>
                SUPPORT MATERIALS ({documents.length})
              </h2>
              {documents.length === 0 ? (
                <p style={{ color: '#475569', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>
                  No documents uploaded yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {documents.map(doc => {
                    const typeInfo = FILE_TYPE_ICONS[doc.file_type] || FILE_TYPE_ICONS.link;
                    const href = doc.external_url
                      ? doc.external_url
                      : `http://localhost:8000/${doc.file_path}`;
                    return (
                      <a
                        key={doc.id}
                        id={`doc-${doc.id}`}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          padding: '0.75rem 1rem',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '10px',
                          textDecoration: 'none',
                          transition: 'all 0.2s',
                          color: 'inherit',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(167,139,250,0.07)';
                          e.currentTarget.style.borderColor = 'rgba(167,139,250,0.2)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>{typeInfo.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            color: '#e2e8f0', fontSize: '0.85rem',
                            fontWeight: 500, overflow: 'hidden',
                            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {doc.file_name}
                          </div>
                          <div style={{ color: typeInfo.color, fontSize: '0.72rem', fontWeight: 600, marginTop: '0.15rem' }}>
                            {typeInfo.label}
                          </div>
                        </div>
                        <svg width="14" height="14" fill="none" stroke="#64748b" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Chat */}
          <div style={{ position: 'sticky', top: '80px' }}>
            <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#34d399', boxShadow: '0 0 8px #34d399',
              }} />
              <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}>
                AI Technician — powered by Gemini
              </span>
            </div>
            <ChatWindow productId={parseInt(id)} />
          </div>
        </div>
      </div>
    </div>
  );
}
