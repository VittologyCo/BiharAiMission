import React, { useState, useEffect } from 'react';
import './PWAInstallBanner.css';

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user previously dismissed banner
    const isDismissed = localStorage.getItem('bihar_ai_pwa_dismissed');
    if (isDismissed) return;

    const handleBeforeInstallPrompt = (e) => {
      // Prevent browser's automatic mini-infobar
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Also check if app is already running in standalone PWA mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      setShowBanner(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the native browser install prompt
    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] Install prompt outcome: ${outcome}`);

    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('bihar_ai_pwa_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="pwa-install-banner">
      <div className="pwa-banner-content">
        <div className="pwa-banner-icon">
          <img src="/bi_logo.png" alt="Bihar AI Mission Logo" />
        </div>
        <div className="pwa-banner-text">
          <div className="pwa-banner-title">Install Bihar AI Mission App 📲</div>
          <div className="pwa-banner-sub">Add to home screen for instant offline access & full-screen app experience.</div>
        </div>
      </div>

      <div className="pwa-banner-actions">
        <button className="pwa-install-btn" onClick={handleInstallClick}>
          Install App →
        </button>
        <button className="pwa-close-btn" onClick={handleDismiss} aria-label="Dismiss">
          ✕
        </button>
      </div>
    </div>
  );
}
