import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../context/ToastContext';
import styles from './CTA.module.css';

export default function CTA({ onOpenContact }) {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const isHi = lang === 'hi';

  const handleContactClick = () => {
    if (onOpenContact) {
      onOpenContact();
    } else {
      window.dispatchEvent(new CustomEvent('bihar_ai_open_contact_modal'));
    }
  };

  return (
    <section className={styles.ctaSection} id="cta" aria-label="Call to Action">
      <div className={styles.container}>
        <div className={styles.ctaCard}>
          {/* Luminous Ambient Background Glows */}
          <div className={styles.topLightGlow} aria-hidden="true" />
          <div className={styles.bottomLightGlow} aria-hidden="true" />

          <div className={styles.contentWrapper}>
            {/* Civic Eyebrow Badge */}
            <div className={styles.badgeWrapper}>
              <span className={styles.beaconDot} />
              <span className={styles.badgeSparkle}>✦</span>
              <span>{isHi ? 'बिहार AI नागरिक पारिस्थितिकी तंत्र · 2026' : 'BIHAR AI CIVIC ECOSYSTEM · EST. 2024'}</span>
            </div>

            {/* Headline */}
            <h2 className={styles.title}>
              {isHi ? (
                <>क्या आप बिहार को <span className={styles.accentText}>AI-सक्षम</span> बनाने के लिए तैयार हैं?</>
              ) : (
                <>Ready to Make Bihar <span className={styles.accentText}>AI-Empowered?</span></>
              )}
            </h2>

            {/* Subtitle */}
            <p className={styles.subtitle}>
              {t.ctaSub || "Join students, officers, researchers, and entrepreneurs building Bihar's artificial intelligence future. Start learning or partner with us today."}
            </p>

            {/* Civic Impact & Trust Badges Strip */}
            <div className={styles.trustStrip}>
              <div className={styles.trustChip}>
                <span className={styles.trustIcon}>🏛️</span>
                <span>{isHi ? 'बिहार सरकार की आधिकारिक पहल' : 'Official Bihar Civic Initiative'}</span>
              </div>
              <div className={styles.trustDivider} />
              <div className={styles.trustChip}>
                <span className={styles.trustIcon}>🌐</span>
                <span>{isHi ? '38 जिले नेटवर्क' : '38 Districts Network'}</span>
              </div>
              <div className={styles.trustDivider} />
              <div className={styles.trustChip}>
                <span className={styles.trustIcon}>🎓</span>
                <span>{isHi ? '100% निःशुल्क शिक्षा' : '100% Free Civic Platform'}</span>
              </div>
            </div>

            {/* Action Buttons Sequence */}
            <div className={styles.buttonGroup}>
              {/* PRIMARY CTA */}
              <button className={styles.primaryBtn} onClick={() => navigate('/learning')}>
                <span className={styles.btnShimmer} aria-hidden="true" />
                <span className={styles.btnLabel}>
                  {isHi ? 'AI सीखना शुरू करें' : 'Start Learning AI'}
                </span>
                <span className={styles.actionBadge}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                </span>
              </button>

              {/* SECONDARY CONTACT CTA (UNLOCKED) */}
              <button 
                className={styles.secondaryBtn} 
                onClick={handleContactClick}
                title={isHi ? 'हमारी टीम से संपर्क करें' : 'Contact Our Team'}
                type="button"
              >
                <span className={styles.contactIcon}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <span className={styles.btnLabel}>{isHi ? 'हमारी टीम से संपर्क करें' : 'Contact Our Team'}</span>
              </button>

              {/* PARTNER INDIAAI CTA */}
              <button 
                className={styles.partnerBtn} 
                onClick={() => window.open('https://indiaai.gov.in', '_blank')}
                rel="noreferrer"
              >
                <span className={styles.btnLabel}>{isHi ? 'IndiaAI.gov.in देखें' : 'Visit IndiaAI.gov.in'}</span>
                <span className={styles.partnerBadge}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17l9.2-9.2M17 17V7H7" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
