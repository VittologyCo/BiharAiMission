import React from 'react';

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
          background: 'var(--color-charcoal-900, #181512)',
          color: 'var(--color-sand-100, #F3ECE0)',
          fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
          padding: '24px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            maxWidth: '560px',
            width: '100%',
            background: '#1F1B17',
            border: '1px solid rgba(226, 139, 92, 0.25)',
            borderRadius: '16px',
            padding: '36px 32px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45)'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#F87171',
              marginBottom: '16px',
              textTransform: 'uppercase'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444' }}></span>
              500 · System Notice
            </div>

            <h1 style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#F3ECE0',
              margin: '0 0 12px 0',
              letterSpacing: '-0.02em'
            }}>
              Something Went Wrong
            </h1>

            <p style={{
              fontSize: '15px',
              lineHeight: '1.6',
              color: '#A8A095',
              margin: '0 0 28px 0'
            }}>
              We encountered an unexpected technical issue processing this request. Our engineering team has been notified. Please refresh the page or return to the home portal.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  padding: '12px 22px',
                  background: '#E28B5C',
                  color: '#181512',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                🔄 Refresh Page
              </button>

              <button
                type="button"
                onClick={this.handleHome}
                style={{
                  padding: '12px 22px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#F3ECE0',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
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
