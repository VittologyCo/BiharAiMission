import React from 'react';
import { logAppError } from '../services/errorLoggingService';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log privately without exposing stack trace to users in UI
    console.error('Unhandled Application Exception caught by ErrorBoundary:', error, errorInfo);
    try {
      logAppError(error, {
        errorType: 'react_boundary',
        metadata: errorInfo || {},
      });
    } catch (e) {}

    // Auto-recover once from external DOM mutation / translator conflicts
    const msg = String(error?.message || '').toLowerCase();
    if (msg.includes('insertbefore') || msg.includes('removechild')) {
      try {
        const reloadKey = 'dom_mutation_recovery_ts';
        const lastReload = parseInt(sessionStorage.getItem(reloadKey) || '0', 10);
        const now = Date.now();
        if (now - lastReload > 15000) {
          sessionStorage.setItem(reloadKey, String(now));
          window.location.reload();
        }
      } catch (storageErr) {}
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-sand-50, #FBF8F3)',
          color: 'var(--color-ink, #181512)',
          fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
          padding: '24px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            maxWidth: '560px',
            width: '100%',
            background: 'var(--color-sand-100, #F3ECE0)',
            border: '1px solid var(--color-ink, #181512)',
            borderRadius: '2px',
            padding: '36px 32px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-soft, 0 1px 2px rgba(24, 21, 18, 0.04))'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              background: 'rgba(220, 38, 38, 0.08)',
              border: '1px solid #DC2626',
              borderRadius: '2px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#DC2626',
              marginBottom: '16px',
              textTransform: 'uppercase'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#DC2626' }}></span>
              500 · Official Notice
            </div>

            <h1 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--color-ink, #181512)',
              margin: '0 0 12px 0',
              letterSpacing: '-0.02em',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Something Went Wrong
            </h1>

            <p style={{
              fontSize: '15px',
              lineHeight: '1.6',
              color: 'var(--color-ink-muted, #5E554D)',
              margin: '0 0 28px 0'
            }}>
              We encountered an unexpected technical issue processing this request. Our engineering team has been notified. Please refresh the page or return to the home portal.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  padding: '10px 20px',
                  background: '#181512',
                  color: '#FBF8F3',
                  border: '1px solid #181512',
                  borderRadius: '2px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Refresh Page
              </button>

              <button
                type="button"
                onClick={this.handleHome}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  color: '#181512',
                  border: '1px solid #181512',
                  borderRadius: '2px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                ← Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
