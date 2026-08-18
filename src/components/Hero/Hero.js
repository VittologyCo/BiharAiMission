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
            <Button variant="primary" size="lg" onClick={onOpenRegistration}>
              {isHi ? '📝 पंजीकरण करें' : '📝 Register Now'}
            </Button>

            <Button variant="secondary" size="lg" onClick={() => navigate('/tools')} className={styles.secondaryHeroBtn}>
              {t.btnTools || 'Explore Tools'}
            </Button>
            <Button variant="ghost" size="lg" onClick={() => navigate('/about')} className={styles.ghostHeroBtn}>
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
