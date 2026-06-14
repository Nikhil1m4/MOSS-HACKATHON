import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const CATEGORIES = ['Electronics', 'Vehicles', 'Appliances', 'Industrial', 'Other'];

export default function AddProduct() {
  const [form, setForm] = useState({
    name: '',
    category: 'Electronics',
    description: '',
    image_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.name.trim()) { setError('Product name is required.'); return; }
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.image_url) delete payload.image_url;
      if (!payload.description) delete payload.description;
      const res = await api.post('/products/', payload);
      setSuccess(`"${res.data.name}" was added successfully!`);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('company_token');
        localStorage.removeItem('company_info');
        navigate('/login');
      } else {
        setError(err.response?.data?.detail || 'Failed to create product. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a14' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          <div style={{
            width: '100%', maxWidth: '600px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(167,139,250,0.15)',
            borderRadius: '20px', padding: '2rem',
            animation: 'fadeIn 0.3s ease',
          }}>
            <div style={{ marginBottom: '1.75rem' }}>
              <h2 style={{ color: '#e2e8f0', fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.3rem' }}>
                Add New Product
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                Fill in the details below. You can upload support materials after creation.
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

            {success && (
              <div style={{
                background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)',
                borderRadius: '10px', padding: '0.75rem 1rem',
                color: '#34d399', fontSize: '0.875rem', marginBottom: '1.25rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                ✅ {success}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Product Name */}
              <div>
                <label style={labelStyle}>PRODUCT NAME *</label>
                <input
                  id="product-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Samsung Galaxy S24 Ultra"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(167,139,250,0.2)'}
                />
              </div>

              {/* Category */}
              <div>
                <label style={labelStyle}>CATEGORY *</label>
                <select
                  id="product-category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(167,139,250,0.2)'}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat} style={{ background: '#1a1a2e' }}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>DESCRIPTION</label>
                <textarea
                  id="product-description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your product — model, features, use case…"
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                  onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(167,139,250,0.2)'}
                />
              </div>

              {/* Image URL */}
              <div>
                <label style={labelStyle}>PRODUCT IMAGE URL (optional)</label>
                <input
                  id="product-image-url"
                  type="url"
                  name="image_url"
                  value={form.image_url}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(167,139,250,0.2)'}
                />
                {form.image_url && (
                  <div style={{ marginTop: '0.75rem', borderRadius: '10px', overflow: 'hidden', height: '140px' }}>
                    <img
                      src={form.image_url}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  style={{
                    flex: 1, padding: '0.85rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', color: '#94a3b8',
                    fontWeight: 600, fontSize: '0.9rem',
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#e2e8f0'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
                >
                  Cancel
                </button>
                <button
                  id="add-product-submit"
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 2, padding: '0.85rem',
                    background: loading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7c3aed, #0891b2)',
                    border: 'none', borderRadius: '12px', color: 'white',
                    fontWeight: 700, fontSize: '0.95rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'Inter, sans-serif',
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
                  {loading ? 'Creating…' : '+ Create Product'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

const labelStyle = {
  color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600,
  letterSpacing: '0.06em', display: 'block', marginBottom: '0.5rem',
};

const inputStyle = {
  width: '100%', padding: '0.8rem 1rem',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(167,139,250,0.2)',
  borderRadius: '10px', color: '#e2e8f0',
  fontSize: '0.95rem', fontFamily: 'Inter, sans-serif',
  outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
};
