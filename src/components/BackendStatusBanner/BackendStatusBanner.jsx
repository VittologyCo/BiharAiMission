import React, { useEffect, useState } from 'react';
import { subscribeToAuthBanner, handleAuthSuccess } from '../../utils/withAuthRetry';

const BackendStatusBanner = () => {
  const [bannerState, setBannerState] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthBanner((event) => {
      if (event.type === 'CLEAR') {
        setBannerState(null);
      } else if (event.type === 'TRANSIENT') {
        setBannerState({
          type: 'TRANSIENT',
          message: event.message || 'Having trouble reaching the server — retrying...',
        });
      } else if (event.type === 'DEGRADED') {
        setBannerState({
          type: 'DEGRADED',
          message:
            event.message ||
            "We're experiencing temporary connectivity issues with our backend provider. Your data is safe — please try again in a moment.",
        });
      } else if (event.type === 'DEAD_SESSION') {
        setBannerState({
          type: 'DEAD_SESSION',
          message: event.message || 'Your session has expired. Please sign in again.',
        });
      }
    });

    return () => unsubscribe();
  }, []);

  if (!bannerState) return null;

  const isTransient = bannerState.type === 'TRANSIENT';
  const isDegraded = bannerState.type === 'DEGRADED';

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        maxWidth: '90%',
        width: '560px',
        background: isTransient ? '#1F1B17' : '#231B15',
        border: isTransient
          ? '1px solid rgba(226, 139, 92, 0.4)'
          : '1px solid rgba(234, 179, 8, 0.5)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
        borderRadius: '12px',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        color: '#F3ECE0',
        fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: '13.5px',
        lineHeight: 1.4,
        animation: 'fadeInSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span
          style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isTransient ? '#E28B5C' : '#FBBF24',
            boxShadow: isTransient
              ? '0 0 8px rgba(226, 139, 92, 0.8)'
              : '0 0 10px rgba(251, 191, 36, 0.8)',
            flexShrink: 0,
          }}
        />
        <span>{bannerState.message}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {isDegraded && (
          <button
            type="button"
            onClick={() => {
              handleAuthSuccess();
              window.location.reload();
            }}
            style={{
              background: '#E28B5C',
              color: '#181512',
              border: 'none',
              padding: '5px 12px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseOver={(e) => (e.target.style.opacity = '0.9')}
            onMouseOut={(e) => (e.target.style.opacity = '1')}
          >
            Retry
          </button>
        )}
        <button
          type="button"
          onClick={() => setBannerState(null)}
          aria-label="Dismiss banner"
          style={{
            background: 'transparent',
            color: '#A8A095',
            border: 'none',
            fontSize: '16px',
            lineHeight: 1,
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default BackendStatusBanner;
