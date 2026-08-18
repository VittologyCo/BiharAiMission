import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../context/ToastContext';
import styles from './CTA.module.css';

export default function CTA({ onOpenContact }) {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const toast = useToast();
  const isHi = lang === 'hi';

  const handleContactClick = () => {
    toast?.info(
      isHi 
        ? '🔒 संपर्क डेस्क वर्तमान में रखरखाव (Maintenance) के अधीन है। शीघ्र उपलब्ध होगा।' 
        : '🔒 The Contact Desk is temporarily locked under scheduled maintenance.'
    );
  };

  return (
    <section className={styles.ctaSection} id="cta" aria-label="Call to Action">
      <div className={styles.container}>
        <div className={styles.ctaCard}>
          {/* Civic Badge */}
          <div className={styles.badgeWrapper}>
            <span className={styles.sparkle}>✦</span>
            <span>{isHi ? 'बिहार AI नागरिक पारिस्थितिकी तंत्र · 2024' : 'BIHAR AI CIVIC ECOSYSTEM · EST. 2024'}</span>
          </div>

          {/* Headline */}
          <h2 className={styles.title}>
            {t.ctaTitle || 'Ready to Make Bihar AI-Empowered?'}
          </h2>

          {/* Subtitle */}
          <p className={styles.subtitle}>
            {t.ctaSub || "Join students, officers, researchers, and entrepreneurs building Bihar's artificial intelligence future. Start learning or partner with us today."}
          </p>

          {/* Action Buttons: Exact 3-Pill Sequence */}
          <div className={styles.buttonGroup}>
            <button className={styles.primaryBtn} onClick={() => navigate('/learning')}>
              <span>{isHi ? 'AI सीखना शुरू करें' : 'Start Learning AI'}</span>
              <span>→</span>
            </button>
            <button 
              className={styles.secondaryBtn} 
              onClick={handleContactClick}
              title={isHi ? 'रखरखाव के अंतर्गत · लॉक' : 'Under Maintenance · Locked'}
            >
              <span>🔒 {isHi ? 'हमारी टीम से संपर्क करें' : 'Contact Our Team'}</span>
            </button>
            <button className={styles.partnerBtn} onClick={() => window.open('https://indiaai.gov.in', '_blank')}>
              <span>{isHi ? 'IndiaAI.gov.in देखें' : 'Visit IndiaAI.gov.in'}</span>
              <span>↗</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
