import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useLanguage } from '../../hooks/useLanguage';
import styles from './StatsPanel.module.css';

export default function StatsPanel() {
  const { t } = useLanguage();
  const panelRef = useRef(null);

  // States for numeric count-ups
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [count3, setCount3] = useState(0);
  const [count4, setCount4] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setCount1(38);
      setCount2(26);
      setCount3(50);
      setCount4(10000);
      setHasAnimated(true);
      return;
    }

    if (!panelRef.current || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);

            // Animate numeric portions over 1.2s
            const obj = { val1: 0, val2: 0, val3: 0, val4: 0 };
            gsap.to(obj, {
              val1: 38,
              val2: 26,
              val3: 50,
              val4: 10000,
              duration: 1.2,
              ease: 'power2.out',
              onUpdate: () => {
                setCount1(Math.floor(obj.val1));
                setCount2(Math.floor(obj.val2));
                setCount3(Math.floor(obj.val3));
                setCount4(Math.floor(obj.val4));
              }
            });

            observer.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(panelRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <div className={styles.statsPanel} ref={panelRef}>
      {/* Title Header */}
      <div className={styles.header}>
        <span className={styles.hudBadge}>HUD TELEMETRY</span>
        <span className={styles.hudTitle}>{t.statsTitle || 'Bihar AI Readiness HUD'}</span>
      </div>

      {/* Grid of Stats */}
      <div className={styles.statsGrid}>
        {/* STAT 1: 38/38 Districts */}
        <div className={styles.statCard}>
          <div className={styles.numberWrapper} aria-hidden="true">
            <span className={styles.animNum}>{count1}</span>
            <span className={styles.suffix}>/38</span>
          </div>
          {/* Screen reader static label */}
          <span className="sr-only">38 out of 38 Districts Covered in Mission Roadmap</span>
          <div className={styles.label}>{t.stat1Lbl || 'Districts Covered in Mission Roadmap'}</div>
        </div>

        {/* STAT 2: 26 Modules */}
        <div className={styles.statCard}>
          <div className={styles.numberWrapper} aria-hidden="true">
            <span className={styles.animNum}>{count2}</span>
          </div>
          <span className="sr-only">26 Free Bilingual AI Modules</span>
          <div className={styles.label}>{t.stat2Lbl || 'Free Bilingual AI Modules'}</div>
        </div>

        {/* STAT 3: 50+ Prompts */}
        <div className={styles.statCard}>
          <div className={styles.numberWrapper} aria-hidden="true">
            <span className={styles.animNum}>{count3}</span>
            <span className={styles.suffix}>+</span>
          </div>
          <span className="sr-only">50 or more Government Officer Prompts</span>
          <div className={styles.label}>{t.stat3Lbl || 'Government Officer Prompts'}</div>
        </div>

        {/* STAT 4: 10,000+ (Target Goal — Visually Differentiated) */}
        <div className={`${styles.statCard} ${styles.goalCard}`}>
          <div className={styles.goalPill}>ROADMAP GOAL</div>
          <div className={styles.numberWrapper} aria-hidden="true">
            <span className={styles.animNum}>{count4.toLocaleString()}</span>
            <span className={styles.suffix}>+</span>
          </div>
          <span className="sr-only">Target Goal: 10,000 or more Officers & Youth Trained</span>
          <div className={styles.label}>{t.stat4Lbl || 'Target Officers & Youth Trained'}</div>
        </div>
      </div>

      {/* Milestone Strip */}
      <div className={styles.milestoneStrip}>
        <div className={styles.milestoneTitle}>{t.stripTitle || 'Key Mission Milestones'}</div>
        <div className={styles.milestoneRow}>
          <span className={styles.mLabel}>{t.strip1Lbl || 'IndiaAI Budget:'}</span>
          <strong className={styles.mValue}>{t.strip1Val || '₹10,371.92 Cr'}</strong>
        </div>
        <div className={styles.milestoneRow}>
          <span className={styles.mLabel}>{t.strip2Lbl || 'Cabinet Approval:'}</span>
          <strong className={styles.mValue}>{t.strip2Val || 'Nov 25, 2025'}</strong>
        </div>
      </div>
    </div>
  );
}
