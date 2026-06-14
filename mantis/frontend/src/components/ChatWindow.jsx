import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

const SendIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const BotAvatar = () => (
  <div style={{
    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg, #7c3aed, #0891b2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px',
  }}>
    🦗
  </div>
);

const TypingIndicator = () => (
  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '6px 2px' }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: '7px', height: '7px', borderRadius: '50%',
        background: '#a78bfa',
        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
      }} />
    ))}
  </div>
);

export default function ChatWindow({ productId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [started, setStarted] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setStarted(true);
    const newUserMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, newUserMsg]);
    setLoading(true);

    try {
      const res = await api.post(`/chat/${productId}`, {
        message: text,
        session_id: sessionId || null,
      });
      setSessionId(res.data.session_id);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Sorry, I couldn\'t reach the AI assistant right now. Please make sure the backend is running.',
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatContent = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>{line}{i < text.split('\n').length - 1 && <br />}</span>
    ));
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(167,139,250,0.15)',
      borderRadius: '20px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '560px',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(8,145,178,0.15))',
        borderBottom: '1px solid rgba(167,139,250,0.15)',
        padding: '1rem 1.25rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
      }}>
        <BotAvatar />
        <div>
          <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.95rem' }}>Mantis AI Technician</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: '#34d399',
              boxShadow: '0 0 6px #34d399',
            }} />
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Online · Expert Diagnostics</span>
          </div>
        </div>
        {sessionId && (
          <span style={{
            marginLeft: 'auto', color: '#64748b', fontSize: '0.7rem',
            background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem',
            borderRadius: '999px', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            Session #{sessionId}
          </span>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Welcome message */}
        {!started && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <BotAvatar />
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(167,139,250,0.15)',
              borderRadius: '4px 16px 16px 16px',
              padding: '0.85rem 1rem',
              maxWidth: '80%',
            }}>
              <p style={{ color: '#e2e8f0', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
                👋 Hello! I'm your Mantis AI support technician for this product.
              </p>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.7, marginTop: '0.5rem', marginBottom: 0 }}>
                Describe your issue and I'll ask a few targeted questions to diagnose it precisely — referencing the exact page in the manual.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              gap: '0.75rem',
              alignItems: 'flex-start',
            }}
          >
            {msg.role === 'assistant' && <BotAvatar />}
            {msg.role === 'user' && (
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                background: 'rgba(167,139,250,0.2)',
                border: '1px solid rgba(167,139,250,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', color: '#a78bfa',
              }}>
                👤
              </div>
            )}
            <div style={{
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                : 'rgba(255,255,255,0.06)',
              border: msg.role === 'user'
                ? 'none'
                : '1px solid rgba(167,139,250,0.12)',
              borderRadius: msg.role === 'user'
                ? '16px 4px 16px 16px'
                : '4px 16px 16px 16px',
              padding: '0.85rem 1rem',
              maxWidth: '78%',
              boxShadow: msg.role === 'user'
                ? '0 4px 20px rgba(124,58,237,0.3)'
                : 'none',
            }}>
              <p style={{
                color: '#e2e8f0',
                fontSize: '0.9rem',
                lineHeight: 1.7,
                margin: 0,
                whiteSpace: 'pre-wrap',
              }}>
                {formatContent(msg.content)}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <BotAvatar />
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(167,139,250,0.12)',
              borderRadius: '4px 16px 16px 16px',
              padding: '0.85rem 1rem',
            }}>
              <TypingIndicator />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        borderTop: '1px solid rgba(167,139,250,0.12)',
        padding: '1rem 1.25rem',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <textarea
            id="chat-input"
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your issue… (Enter to send)"
            rows={1}
            disabled={loading}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(167,139,250,0.2)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              color: '#e2e8f0',
              fontSize: '0.9rem',
              fontFamily: 'Inter, sans-serif',
              resize: 'none',
              outline: 'none',
              transition: 'border-color 0.2s',
              minHeight: '44px',
              maxHeight: '120px',
              lineHeight: 1.5,
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(167,139,250,0.2)'}
          />
          <button
            id="chat-send-btn"
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              width: '44px', height: '44px',
              borderRadius: '12px',
              background: (loading || !input.trim())
                ? 'rgba(124,58,237,0.2)'
                : 'linear-gradient(135deg, #7c3aed, #0891b2)',
              border: 'none',
              cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: (loading || !input.trim()) ? '#64748b' : 'white',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
          >
            <SendIcon />
          </button>
        </form>
        <p style={{ color: '#475569', fontSize: '0.72rem', marginTop: '0.6rem', textAlign: 'center' }}>
          The AI may ask follow-up questions before diagnosing — this ensures accuracy.
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
