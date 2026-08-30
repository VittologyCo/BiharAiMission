import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../context/ToastContext';
import StatsPanel from '../StatsPanel/StatsPanel';
import Button from '../Button/Button';
import styles from './Hero.module.css';

export default function Hero({ onOpenRegistration }) {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const toast = useToast();
  const heroContentRef = useRef(null);
  const isHi = lang === 'hi';

  // GSAP Staggered Entrance Animation (Headline -> Subhead -> CTAs -> Alignments)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !heroContentRef.current) return;

    const elements = heroContentRef.current.children;
    gsap.fromTo(
      elements,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.12,
        ease: 'power2.out',
        delay: 0.08
      }
    );
  }, []);

  const handleLockedClick = () => {
    toast?.info(
      isHi
        ? '🔒 यह सुविधा अभी निर्माणाधीन है। कृपया पहले नीचे पंजीकरण करें।'
        : '🔒 This feature is under development. Please register below first.'
    );
  };

  return (
    <section className={styles.heroSection} id="hero">
      <div className={styles.heroContainer}>
        <div className={styles.heroMain} ref={heroContentRef}>
          {/* Civic Tag */}
          <div className={styles.civicTag}>
            <span className={styles.tagDot} />
            <span>{t.hTag || 'Independent Civic Initiative · Est. 2024 · biharaimission.org'}</span>
          </div>

          {/* Headline */}
          <h1
            className={styles.title}
            dangerouslySetInnerHTML={{ __html: t.hTitle || 'Bringing <span class="ac">AI Literacy &amp;<br>Opportunity</span> to<br>Every Corner of Bihar' }}
          />

          {/* Description */}
          <p className={styles.description}>
            {t.hDesc || "India launched its ₹10,372 crore national AI mission in 2024. Bihar AI Mission is a citizen-led effort to translate that national vision into local action — building AI awareness, skills, and practical tools specifically for Bihar's officers, students, startups, and communities."}
          </p>

          {/* CTAs */}
          <div className={styles.ctaGroup}>
            {/* REGISTER NOW — Primary CTA opening registration modal */}
            <Button
              variant="primary"
              size="lg"
              onClick={onOpenRegistration}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              }
              showArrow={true}
            >
              {isHi ? 'पंजीकरण करें' : 'Register Now'}
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/tools')}
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              }
            >
              {t.btnTools || 'Explore Tools'}
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigate('/about')}
            >
              {t.btnMission || 'Our Mission →'}
            </Button>
          </div>

          {/* Alignment Badges */}
          <div className={styles.alignRow}>
            <span className={styles.alignLabel}>{t.alignedWith || 'Aligned with:'}</span>
            <span className={styles.chip}>{t.chip1 || 'IndiaAI Mission (MeitY)'}</span>
            <span className={styles.chip}>{t.chip2 || 'Digital India'}</span>
            <span className={styles.chip}>{t.chip3 || 'IndiaAI FutureSkills'}</span>
          </div>
        </div>

        {/* Stats Panel */}
        <div className={styles.statsContainer}>
          <StatsPanel />
        </div>
      </div>
    </section>
  );
}
