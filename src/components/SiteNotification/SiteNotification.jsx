import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../utils/supabase';
import styles from './SiteNotification.module.css';

// ═══════════════════════════════════════════════════════════════════════
// Type configuration — icon, label, and color theme per notification type
// ═══════════════════════════════════════════════════════════════════════
const TYPE_CONFIG = {
  info:         { icon: 'ℹ️',  label: 'Information' },
  warning:      { icon: '⚠️',  label: 'Warning' },
  alert:        { icon: '🚨', label: 'Alert' },
  success:      { icon: '✅', label: 'Success' },
  announcement: { icon: '📢', label: 'Announcement' },
  maintenance:  { icon: '🔧', label: 'Maintenance' },
};

// ═══════════════════════════════════════════════════════════════════════
// Dismiss helpers — localStorage-based per-notification dismiss tracking
// ═══════════════════════════════════════════════════════════════════════
const getDismissKey = (id) => `bam_dismissed_notif_${id}`;

const isDismissed = (id) => {
  try {
    return localStorage.getItem(getDismissKey(id)) === '1';
  } catch {
    return false;
  }
};

const markDismissed = (id) => {
  try {
    localStorage.setItem(getDismissKey(id), '1');
  } catch {}
};

// ═══════════════════════════════════════════════════════════════════════
// Format date for display
// ═══════════════════════════════════════════════════════════════════════
const formatNotifDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

// ═══════════════════════════════════════════════════════════════════════
// COMPONENT: SiteNotification
// Fetches active notifications from Supabase and renders a modal overlay
// ═══════════════════════════════════════════════════════════════════════
export default function SiteNotification() {
  const [notifications, setNotifications] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // ─── Fetch active notifications ───
  const fetchNotifications = useCallback(async () => {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('site_notifications')
        .select('id, title, description, banner_image, notification_type, priority, is_active, expires_at, created_at')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.warn('SiteNotification fetch notice:', error.message);
        return;
      }

      if (!data || data.length === 0) return;

      // Filter out expired and already-dismissed notifications
      const active = data.filter((n) => {
        if (isDismissed(n.id)) return false;
        if (n.expires_at && new Date(n.expires_at).getTime() < new Date(now).getTime()) return false;
        return true;
      });

      if (active.length > 0) {
        setNotifications(active);
        setCurrentIndex(0);
        setIsVisible(true);
      }
    } catch (err) {
      console.warn('SiteNotification error:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ─── Close / Dismiss current notification ───
  const handleDismiss = useCallback(() => {
    const current = notifications[currentIndex];
    if (current) {
      markDismissed(current.id);
    }

    // If there are more notifications, show the next one
    const remaining = notifications.filter((n, i) => i !== currentIndex && !isDismissed(n.id));

    if (remaining.length > 0) {
      setNotifications(remaining);
      setCurrentIndex(0);
    } else {
      // Animate out
      setIsClosing(true);
      setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
      }, 300);
    }
  }, [notifications, currentIndex]);

  // ─── Navigate between multiple notifications ───
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : notifications.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < notifications.length - 1 ? prev + 1 : 0));
  };

  // ─── Keyboard: Escape to dismiss ───
  useEffect(() => {
    if (!isVisible) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') handleDismiss();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isVisible, handleDismiss]);

  // ─── Don't render if nothing to show ───
  if (!isVisible || notifications.length === 0) return null;

  const current = notifications[currentIndex];
  if (!current) return null;

  const typeKey = current.notification_type || 'info';
  const config = TYPE_CONFIG[typeKey] || TYPE_CONFIG.info;
  const hasMultiple = notifications.length > 1;

  const overlayContent = (
    <div
      className={styles.overlay}
      style={{
        opacity: isClosing ? 0 : 1,
        transition: 'opacity 0.3s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Site Notification: ${current.title}`}
    >
      <div className={styles.card}>
        {/* Type color stripe at top */}
        <div className={styles.typeStripe} data-type={typeKey} />

        {/* Close button */}
        <button
          className={styles.closeBtn}
          onClick={handleDismiss}
          aria-label="Close notification"
          title="Dismiss this notification"
        >
          ✕
        </button>

        {/* Optional Banner Image */}
        {current.banner_image && (
          <img
            src={current.banner_image}
            alt={current.title || 'Notification banner'}
            className={styles.bannerImage}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}

        {/* Body */}
        <div className={styles.body}>
          {/* Type Badge */}
          <div className={styles.typeBadge} data-type={typeKey}>
            <span>{config.icon}</span>
            <span>{config.label}</span>
          </div>

          {/* Title */}
          {current.title && (
            <h2 className={styles.title}>{current.title}</h2>
          )}

          {/* Description */}
          {current.description && (
            <p className={styles.description}>{current.description}</p>
          )}

          {/* Footer */}
          <div className={styles.footer}>
            <div>
              {/* Timestamp */}
              <span className={styles.timestamp}>
                {formatNotifDate(current.created_at)}
              </span>

              {/* Multi-notification indicator */}
              {hasMultiple && (
                <div className={styles.multiIndicator} style={{ marginTop: '8px' }}>
                  <div className={styles.dotIndicator}>
                    {notifications.map((_, i) => (
                      <span
                        key={i}
                        className={`${styles.dot} ${i === currentIndex ? styles.active : ''}`}
                      />
                    ))}
                  </div>
                  <span>{currentIndex + 1} of {notifications.length}</span>
                  <div className={styles.navArrows}>
                    <button className={styles.navArrowBtn} onClick={handlePrev} title="Previous notification">
                      ‹
                    </button>
                    <button className={styles.navArrowBtn} onClick={handleNext} title="Next notification">
                      ›
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              className={styles.dismissBtn}
              onClick={handleDismiss}
            >
              {hasMultiple ? 'Dismiss & Next' : 'Got it'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(overlayContent, document.body);
}
