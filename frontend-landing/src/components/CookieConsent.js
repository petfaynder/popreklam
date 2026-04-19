'use client';

import { useState, useEffect } from 'react';

const COOKIE_KEY = 'mrpop_cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem(COOKIE_KEY);
    if (saved) return; // already decided

    // Appear 3.5s after page load
    const timer = setTimeout(() => setVisible(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = (choice) => {
    setLeaving(true);
    setTimeout(() => {
      localStorage.setItem(COOKIE_KEY, JSON.stringify({ choice, preferences, ts: Date.now() }));
      setVisible(false);
      setLeaving(false);
    }, 380);
  };

  const handleAcceptAll = () => {
    setPreferences({ necessary: true, analytics: true, marketing: true });
    dismiss('accept-all');
  };

  const handleRejectAll = () => {
    setPreferences({ necessary: true, analytics: false, marketing: false });
    dismiss('reject-all');
  };

  const handleSavePreferences = () => {
    dismiss('custom');
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes cookie-slide-up {
          from { transform: translateY(110%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes cookie-slide-down {
          from { transform: translateY(0);    opacity: 1; }
          to   { transform: translateY(110%); opacity: 0; }
        }
        @keyframes cookie-details-open {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cookie-banner {
          animation: cookie-slide-up 0.42s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .cookie-banner.leaving {
          animation: cookie-slide-down 0.38s cubic-bezier(0.55, 0, 0.45, 1) both;
        }
        .cookie-details {
          animation: cookie-details-open 0.28s ease both;
        }
        .cookie-toggle {
          appearance: none;
          width: 40px;
          height: 22px;
          background: #dcdad5;
          border: 2px solid #1a1a1a;
          border-radius: 0;
          position: relative;
          cursor: pointer;
          transition: background 0.15s;
          flex-shrink: 0;
        }
        .cookie-toggle:checked {
          background: #ff3366;
        }
        .cookie-toggle:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .cookie-toggle::after {
          content: '';
          position: absolute;
          width: 14px;
          height: 14px;
          background: #1a1a1a;
          top: 2px;
          left: 2px;
          transition: left 0.15s;
        }
        .cookie-toggle:checked::after {
          left: 20px;
          background: #ffffff;
        }
        .cookie-btn-primary {
          background: #1a1a1a;
          color: #fdfbf7;
          border: 2px solid #1a1a1a;
          padding: 10px 22px;
          font-weight: 800;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: background 0.12s, color 0.12s, transform 0.1s;
          font-family: var(--font-heading, 'Space Grotesk', sans-serif);
          white-space: nowrap;
        }
        .cookie-btn-primary:hover {
          background: #ff3366;
          border-color: #ff3366;
          transform: translateY(-1px);
        }
        .cookie-btn-secondary {
          background: transparent;
          color: #1a1a1a;
          border: 2px solid #1a1a1a;
          padding: 10px 22px;
          font-weight: 800;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: background 0.12s, color 0.12s, transform 0.1s;
          font-family: var(--font-heading, 'Space Grotesk', sans-serif);
          white-space: nowrap;
        }
        .cookie-btn-secondary:hover {
          background: #1a1a1a;
          color: #fdfbf7;
          transform: translateY(-1px);
        }
        .cookie-btn-ghost {
          background: transparent;
          color: #666666;
          border: none;
          padding: 4px 0;
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
          font-family: var(--font-heading, 'Space Grotesk', sans-serif);
          transition: color 0.12s;
        }
        .cookie-btn-ghost:hover { color: #ff3366; }
      `}</style>

      <div
        className={`cookie-banner${leaving ? ' leaving' : ''}`}
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          width: 'min(780px, calc(100vw - 32px))',
          background: '#fdfbf7',
          border: '3px solid #1a1a1a',
          boxShadow: '6px 6px 0px #1a1a1a',
          fontFamily: "var(--font-body, 'Outfit', sans-serif)",
        }}
        role="dialog"
        aria-modal="false"
        aria-label="Cookie consent"
      >
        {/* Top accent bar */}
        <div style={{ height: '4px', background: '#ff3366', width: '100%' }} />

        <div style={{ padding: '20px 24px 20px 24px' }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
            <span style={{
              fontSize: '1.5rem',
              lineHeight: 1,
              flexShrink: 0,
              marginTop: '2px',
            }}>🍪</span>
            <div style={{ flex: 1 }}>
              <p style={{
                fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)",
                fontWeight: 900,
                fontSize: '0.95rem',
                textTransform: 'uppercase',
                letterSpacing: '-0.01em',
                color: '#1a1a1a',
                margin: '0 0 5px 0',
              }}>
                We use cookies.
              </p>
              <p style={{
                fontSize: '0.82rem',
                color: '#555',
                margin: 0,
                lineHeight: 1.55,
                fontWeight: 500,
              }}>
                We use cookies to enhance your browsing experience, serve personalized ads, and analyze our traffic.
                By clicking <strong style={{ color: '#1a1a1a' }}>Accept All</strong>, you consent to our use of cookies.{' '}
                <a
                  href="/privacy"
                  style={{ color: '#ff3366', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '3px' }}
                >
                  Cookie Policy
                </a>
              </p>
            </div>
          </div>

          {/* Preferences panel */}
          {showDetails && (
            <div className="cookie-details" style={{
              border: '2px solid #1a1a1a',
              background: '#f0eee9',
              marginBottom: '16px',
            }}>
              {[
                {
                  key: 'necessary',
                  label: 'Necessary',
                  desc: 'Required for the website to function. Cannot be disabled.',
                  disabled: true,
                },
                {
                  key: 'analytics',
                  label: 'Analytics',
                  desc: 'Helps us understand how visitors interact with our platform.',
                  disabled: false,
                },
                {
                  key: 'marketing',
                  label: 'Marketing',
                  desc: 'Used to deliver personalized ads and track campaign effectiveness.',
                  disabled: false,
                },
              ].map((item, i, arr) => (
                <div
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    padding: '12px 16px',
                    borderBottom: i < arr.length - 1 ? '1px solid #dcdad5' : 'none',
                  }}
                >
                  <div>
                    <p style={{
                      fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)",
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: '#1a1a1a',
                      margin: '0 0 2px 0',
                    }}>
                      {item.label}
                      {item.disabled && (
                        <span style={{
                          marginLeft: '8px',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          background: '#1a1a1a',
                          color: '#fdfbf7',
                          padding: '1px 6px',
                          letterSpacing: '0.06em',
                        }}>ALWAYS ON</span>
                      )}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#666', margin: 0, fontWeight: 500 }}>
                      {item.desc}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="cookie-toggle"
                    checked={preferences[item.key]}
                    disabled={item.disabled}
                    onChange={() =>
                      !item.disabled &&
                      setPreferences(p => ({ ...p, [item.key]: !p[item.key] }))
                    }
                    aria-label={`Toggle ${item.label} cookies`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Action row */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}>
            <button className="cookie-btn-ghost" onClick={() => setShowDetails(v => !v)}>
              {showDetails ? '▲ Hide preferences' : '▼ Manage preferences'}
            </button>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {showDetails ? (
                <>
                  <button className="cookie-btn-secondary" onClick={handleRejectAll}>
                    Reject all
                  </button>
                  <button className="cookie-btn-primary" onClick={handleSavePreferences}>
                    Save preferences
                  </button>
                </>
              ) : (
                <>
                  <button className="cookie-btn-secondary" onClick={handleRejectAll}>
                    Reject all
                  </button>
                  <button className="cookie-btn-primary" onClick={handleAcceptAll}>
                    Accept all
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
