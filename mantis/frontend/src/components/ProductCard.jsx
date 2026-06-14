import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORY_COLORS = {
  Electronics: { bg: 'rgba(139,92,246,0.15)', text: '#a78bfa', border: 'rgba(139,92,246,0.3)' },
  Vehicles:    { bg: 'rgba(239,68,68,0.12)',  text: '#f87171', border: 'rgba(239,68,68,0.25)' },
  Appliances:  { bg: 'rgba(16,185,129,0.12)', text: '#34d399', border: 'rgba(16,185,129,0.25)' },
  Industrial:  { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
  Other:       { bg: 'rgba(100,116,139,0.15)',text: '#94a3b8', border: 'rgba(100,116,139,0.3)' },
};

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=400&q=80',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80',
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80',
];

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  const categoryStyle = CATEGORY_COLORS[product.category] || CATEGORY_COLORS.Other;
  const fallbackImg = PLACEHOLDER_IMAGES[product.id % PLACEHOLDER_IMAGES.length];
  const imgSrc = (!imgError && product.image_url) ? product.image_url : fallbackImg;

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => navigate(`/product/${product.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? 'rgba(255,255,255,0.07)'
          : 'rgba(255,255,255,0.04)',
        border: hovered
          ? '1px solid rgba(167,139,250,0.4)'
          : '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 20px 60px rgba(124,58,237,0.2), 0 4px 24px rgba(0,0,0,0.4)'
          : '0 4px 20px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
        <img
          src={imgSrc}
          alt={product.name}
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(15,15,26,0.85) 0%, transparent 60%)',
        }} />
        {/* Category Badge */}
        <span style={{
          position: 'absolute', top: '12px', right: '12px',
          padding: '0.25rem 0.75rem',
          background: categoryStyle.bg,
          border: `1px solid ${categoryStyle.border}`,
          color: categoryStyle.text,
          borderRadius: '999px',
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          backdropFilter: 'blur(8px)',
        }}>
          {product.category}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h3 style={{
          color: '#e2e8f0',
          fontSize: '1.05rem',
          fontWeight: 700,
          lineHeight: 1.3,
          margin: 0,
        }}>
          {product.name}
        </h3>

        {product.company && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{
              width: '20px', height: '20px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #0891b2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.6rem', color: 'white', fontWeight: 700,
            }}>
              {product.company.name[0].toUpperCase()}
            </div>
            <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>
              {product.company.name}
            </span>
          </div>
        )}

        {product.description && (
          <p style={{
            color: '#64748b',
            fontSize: '0.85rem',
            lineHeight: 1.6,
            margin: 0,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {product.description}
          </p>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
          <button
            id={`view-product-${product.id}`}
            style={{
              width: '100%',
              padding: '0.65rem',
              background: hovered
                ? 'linear-gradient(135deg, #7c3aed, #0891b2)'
                : 'rgba(124,58,237,0.12)',
              border: hovered
                ? 'none'
                : '1px solid rgba(124,58,237,0.3)',
              borderRadius: '10px',
              color: hovered ? 'white' : '#a78bfa',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              transition: 'all 0.25s ease',
              letterSpacing: '0.02em',
            }}
          >
            {hovered ? '→ View & Chat' : 'View Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
