import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const LINK_TYPES = [
  { value: 'link', label: 'Website / Documentation' },
  { value: 'video', label: 'YouTube / Video' },
];

const FILE_TYPE_META = {
  pdf:   { icon: '📄', color: '#f87171', label: 'PDF Document' },
  image: { icon: '🖼️', color: '#34d399', label: 'Image' },
  link:  { icon: '🔗', color: '#60a5fa', label: 'External Link' },
  video: { icon: '🎬', color: '#fbbf24', label: 'Video' },
};

export default function UploadMaterials() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [error, setError] = useState('');

  // File upload state (support multiple files)
  const [files, setFiles] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileMsg, setFileMsg] = useState('');
  const [fileMsgType, setFileMsgType] = useState('');
  const fileInputRef = useRef(null);

  // Link upload state (support multiple links)
  const [links, setLinks] = useState([{ url: '', type: 'link', text: '' }]);
  const [uploadingLink, setUploadingLink] = useState(false);
  const [linkMsg, setLinkMsg] = useState('');
  const [linkMsgType, setLinkMsgType] = useState('');

  const fetchData = async () => {
    try {
      const [prodRes, docsRes] = await Promise.all([
        api.get(`/products/${productId}`),
        api.get(`/products/${productId}/documents`),
      ]);
      setProduct(prodRes.data);
      setDocuments(docsRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('company_token');
        navigate('/login');
      } else {
        setError('Failed to load product data.');
      }
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => { fetchData(); }, [productId]);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!files || files.length === 0) { setFileMsg('Please select at least one file.'); setFileMsgType('error'); return; }
    setUploadingFile(true);
    setFileMsg('');
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));
      await api.post(`/products/${productId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFileMsg(`Uploaded ${files.length} file(s) successfully!`);
      setFileMsgType('success');
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchData();
    } catch (err) {
      setFileMsg(err.response?.data?.detail || 'Upload failed. Please try again.');
      setFileMsgType('error');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleLinkUpload = async (e) => {
    e.preventDefault();
    const validLinks = links.filter(l => l.url && l.url.trim());
    if (validLinks.length === 0) { setLinkMsg('Please enter at least one URL.'); setLinkMsgType('error'); return; }
    setUploadingLink(true);
    setLinkMsg('');
    try {
      const formData = new FormData();
      validLinks.forEach(l => {
        formData.append('link_urls', l.url.trim());
        formData.append('link_types', l.type || 'link');
        formData.append('link_texts', l.text ? l.text.trim() : '');
      });
      await api.post(`/products/${productId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLinkMsg('Link(s) added successfully!');
      setLinkMsgType('success');
      setLinks([{ url: '', type: 'link', text: '' }]);
      await fetchData();
    } catch (err) {
      setLinkMsg(err.response?.data?.detail || 'Failed to add link.');
      setLinkMsgType('error');
    } finally {
      setUploadingLink(false);
    }
  };

  if (loadingPage) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a14' }}>
        <Sidebar />
        <div style={{ flex: 1, marginLeft: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            border: '3px solid rgba(167,139,250,0.15)',
            borderTop: '3px solid #a78bfa',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a14' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, padding: '2rem', maxWidth: '900px' }}>

          {/* Product Info */}
          {product && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              marginBottom: '2rem', padding: '1.25rem',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(167,139,250,0.12)',
              borderRadius: '16px',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #7c3aed, #0891b2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem',
              }}>
                📦
              </div>
              <div>
                <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1rem' }}>{product.name}</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.1rem' }}>
                  {product.category} · {documents.length} materials uploaded
                </div>
              </div>
              <button
                onClick={() => navigate('/')}
                style={{
                  marginLeft: 'auto', padding: '0.5rem 1rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', color: '#94a3b8',
                  fontWeight: 600, fontSize: '0.8rem',
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; }}
              >
                ← Dashboard
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* File Upload Card */}
            <div style={cardStyle}>
              <h3 style={cardTitleStyle}>📁 Upload File</h3>
              <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                Upload PDF manuals or product images. PDFs are automatically indexed for AI search.
              </p>

              {fileMsg && (
                <div style={{
                  ...msgStyle,
                  background: fileMsgType === 'success' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                  border: `1px solid ${fileMsgType === 'success' ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
                  color: fileMsgType === 'success' ? '#34d399' : '#f87171',
                }}>
                  {fileMsgType === 'success' ? '✅' : '⚠️'} {fileMsg}
                </div>
              )}

              <form onSubmit={handleFileUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div
                    style={{
                      border: '2px dashed rgba(167,139,250,0.25)',
                      borderRadius: '12px', padding: '1.5rem',
                      textAlign: 'center', cursor: 'pointer',
                      background: 'rgba(167,139,250,0.03)',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      const f = e.dataTransfer.files;
                      if (f && f.length) setFiles(prev => [...prev, ...Array.from(f)]);
                    }}
                  >
                    {files && files.length > 0 ? (
                      <div>
                        <div style={{ fontSize: '1rem', marginBottom: '0.4rem' }}>📁 {files.length} file(s) selected</div>
                        <div style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 600 }}> 
                          {files.map((f, i) => (
                            <div key={i} style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{f.name} • {(f.size/1024/1024).toFixed(2)} MB</div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>☁️</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                          Drop files here or <span style={{ color: '#a78bfa', fontWeight: 600 }}>browse</span>
                        </div>
                        <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.3rem' }}>
                          PDF, JPG, PNG, WEBP
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    id="file-input"
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                    multiple
                    onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files || [])])}
                    style={{ display: 'none' }}
                  />
                <button
                  id="upload-file-btn"
                  type="submit"
                  disabled={uploadingFile || files.length === 0}
                  style={submitBtnStyle(uploadingFile || files.length === 0)}
                  onMouseEnter={e => { if (!uploadingFile && files.length) e.currentTarget.style.opacity = '0.88'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                >
                  {uploadingFile && <Spinner />}
                  {uploadingFile ? 'Uploading…' : `Upload ${files.length || ''} File(s)`}
                </button>
              </form>
            </div>

            {/* Link Upload Card */}
            <div style={cardStyle}>
              <h3 style={cardTitleStyle}>🔗 Add External Link</h3>
              <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                Add YouTube videos, documentation websites, or any external resource URL.
              </p>

              {linkMsg && (
                <div style={{
                  ...msgStyle,
                  background: linkMsgType === 'success' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                  border: `1px solid ${linkMsgType === 'success' ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
                  color: linkMsgType === 'success' ? '#34d399' : '#f87171',
                }}>
                  {linkMsgType === 'success' ? '✅' : '⚠️'} {linkMsg}
                </div>
              )}

              <form onSubmit={handleLinkUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {links.map((l, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <select
                          value={l.type}
                          onChange={e => setLinks(prev => prev.map((p, i) => i === idx ? { ...p, type: e.target.value } : p))}
                          style={{ ...inputStyle, width: '36%' }}
                        >
                          {LINK_TYPES.map(lt => (
                            <option key={lt.value} value={lt.value}>{lt.label}</option>
                          ))}
                        </select>
                        <input
                          type="url"
                          value={l.url}
                          onChange={e => setLinks(prev => prev.map((p, i) => i === idx ? { ...p, url: e.target.value } : p))}
                          placeholder="https://…"
                          style={{ ...inputStyle, flex: 1 }}
                        />
                        <button type="button" onClick={() => setLinks(prev => prev.filter((_, i) => i !== idx))} style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', color: '#f87171' }}>Remove</button>
                      </div>
                      <input
                        type="text"
                        maxLength={50}
                        value={l.text || ''}
                        onChange={e => setLinks(prev => prev.map((p, i) => i === idx ? { ...p, text: e.target.value } : p))}
                        placeholder="Link title or description (optional, max 50 chars)"
                        style={inputStyle}
                      />
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" onClick={() => setLinks(prev => [...prev, { url: '', type: 'link', text: '' }])} style={{ padding: '0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>+ Add another link</button>
                    <div style={{ flex: 1 }} />
                  </div>
                  <button
                    id="add-link-btn"
                    type="submit"
                    disabled={uploadingLink || links.every(l => !l.url.trim())}
                    style={submitBtnStyle(uploadingLink || links.every(l => !l.url.trim()))}
                  >
                    {uploadingLink && <Spinner />}
                    {uploadingLink ? 'Adding…' : `Add ${links.filter(l=>l.url.trim()).length || ''} Link(s)`}
                  </button>
              </form>
            </div>
          </div>

          {/* Uploaded Materials */}
          <div style={cardStyle}>
            <h3 style={{ ...cardTitleStyle, marginBottom: '1.25rem' }}>
              Uploaded Materials ({documents.length})
            </h3>
            {documents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#475569', fontSize: '0.875rem' }}>
                No materials uploaded yet. Use the forms above to get started.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {documents.map(doc => {
                  const meta = FILE_TYPE_META[doc.file_type] || FILE_TYPE_META.link;
                  const href = doc.external_url
                    ? doc.external_url
                    : `http://localhost:8000/${doc.file_path}`;
                  return (
                    <div key={doc.id} style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '10px',
                    }}>
                      <span style={{ fontSize: '1.1rem' }}>{meta.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 500,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {doc.file_name}
                        </div>
                        <div style={{ color: meta.color, fontSize: '0.72rem', fontWeight: 600, marginTop: '0.1rem' }}>
                          {meta.label}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <a
                          href={href} target="_blank" rel="noopener noreferrer"
                          style={{
                            color: '#64748b', fontSize: '0.75rem',
                            textDecoration: 'none', padding: '0.3rem 0.6rem',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '6px', border: '1px solid rgba(255,255,255,0.07)',
                            transition: 'all 0.2s',
                          }}
                        >
                          Open ↗
                        </a>
                        <button
                          onClick={async () => {
                            try {
                              await api.delete(`/documents/${doc.id}`);
                              await fetchData();
                            } catch (err) {
                              alert(err.response?.data?.detail || 'Failed to delete document');
                            }
                          }}
                          style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.12)', color: '#f87171' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

const Spinner = () => (
  <div style={{
    width: '15px', height: '15px', borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white',
    animation: 'spin 0.7s linear infinite',
  }} />
);

const cardStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(167,139,250,0.12)',
  borderRadius: '16px', padding: '1.5rem',
};

const cardTitleStyle = {
  color: '#e2e8f0', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem',
};

const msgStyle = {
  borderRadius: '8px', padding: '0.65rem 0.9rem',
  fontSize: '0.8rem', marginBottom: '1rem',
};

const labelStyle = {
  color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600,
  letterSpacing: '0.06em', display: 'block', marginBottom: '0.5rem',
};

const inputStyle = {
  width: '100%', padding: '0.75rem 0.9rem',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(167,139,250,0.2)',
  borderRadius: '10px', color: '#e2e8f0',
  fontSize: '0.9rem', fontFamily: 'Inter, sans-serif',
  outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
};

const submitBtnStyle = (disabled) => ({
  width: '100%', padding: '0.8rem',
  background: disabled ? 'rgba(124,58,237,0.3)' : 'linear-gradient(135deg, #7c3aed, #0891b2)',
  border: 'none', borderRadius: '10px', color: disabled ? '#64748b' : 'white',
  fontWeight: 700, fontSize: '0.875rem',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily: 'Inter, sans-serif',
  transition: 'opacity 0.2s',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
});
