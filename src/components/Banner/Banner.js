import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import styles from './Banner.module.css';

export default function Banner() {
  const { lang } = useLanguage();
  const isHi = lang === 'hi';

  return (
    <aside className={styles.bannerStrip} aria-label="Disclaimer Banner">
      <div className={styles.container}>
        <div className={styles.disclaimerBlock}>
          <span className={styles.civicBadge}>
            {isHi ? 'स्वतंत्र पहल' : 'Independent Initiative'}
          </span>
          <span className={styles.disclaimerText}>
            {isHi 
              ? 'एक नागरिक-नेतृत्व वाली AI साक्षरता पहल।' 
              : 'A citizen-led civic AI literacy initiative.'}
          </span>
        </div>

        <div className={styles.indiaAiBlock}>
          <span className={styles.metaText}>
            {isHi ? 'IndiaAI से प्रेरित' : 'Inspired by IndiaAI'}
          </span>
          <span className={styles.dot}>·</span>
          <a
            href="https://indiaai.gov.in"
            target="_blank"
            rel="noreferrer"
            className={styles.govLink}
          >
            IndiaAI.gov.in ↗
          </a>
        </div>
      </div>
    </aside>
  );
}
