import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useLanguage } from '../../hooks/useLanguage';
import styles from './Pillars.module.css';

export default function Pillars() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const sectionRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !sectionRef.current) return;

    const cards = sectionRef.current.querySelectorAll(`.${styles.bentoCard}`);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              cards,
              { opacity: 0, y: 28 },
              { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out' }
            );
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // 3D Tilt Parallax & Specular Glare Mouse Handlers
  const handleMouseMove = (e) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const rotateX = (0.5 - py) * 14;
    const rotateY = (px - 0.5) * 14;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(0, -6px, 16px)`;
    card.style.setProperty('--glare-x', `${px * 100}%`);
    card.style.setProperty('--glare-y', `${py * 100}%`);
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)';
  };

  return (
    <section className={styles.pillarsSection} ref={sectionRef} id="pillars">
      <div className={styles.container}>
        {/* Boxed Container with #F3EADA background */}
        <div className={styles.pillarsBox}>
          {/* Section Header */}
          <div className={styles.header}>
            <div className={styles.sectionBadge}>
              <span className={styles.badgeLine} />
              {t.pilEye || 'CORE FOCUS PILLARS'}
            </div>
            <h2 className={styles.title}>{t.pilTitle || "Building Bihar's AI Ecosystem"}</h2>
            <p className={styles.subtitle}>
              {t.pilSub || 'A high-level overview of our mission. Select any pillar below to visit its dedicated hub.'}
            </p>
          </div>

          {/* Bento Grid with 3D Perspective (All 4 cards preserved) */}
          <div className={styles.bentoGrid}>
            {/* BENTO HERO CARD 1: LEARNING HUB */}
            <article
              className={`${styles.bentoCard} ${styles.heroCard}`}
              onClick={() => navigate('/learning')}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className={styles.glareOverlay} />
              <div className={styles.cardInner}>
                <div className={styles.cardTop}>
                  <div className={`${styles.iconWrapper} ${styles.terracottaAccent}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 10v6M2 10l10-7 10 7-10 7-10-7z" />
                      <path d="M6 12v5c3.33 2 4.67 2 6 2s2.67 0 6-2v-5" />
                    </svg>
                  </div>
                  <span className={styles.tagPill}>FREE SKILLS & CERTIFICATES</span>
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{t.p2Title || 'AI Learning Hub'}</h3>
                  <p className={styles.cardDesc}>
                    {t.p2Desc || 'Free bilingual courses, certificates, and hands-on modules inspired by IndiaAI FutureSkills for students and officers.'}
                  </p>
                </div>

                <div className={styles.cardAction}>
                  <span>{t.p2Link || 'Open Learning Hub Page'}</span>
                  <span className={styles.arrow}>→</span>
                </div>
              </div>
            </article>

            {/* BENTO CARD 2: AI TOOLS */}
            <article
              className={`${styles.bentoCard} ${styles.toolsCard}`}
              onClick={() => navigate('/tools')}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className={styles.glareOverlay} />
              <div className={styles.cardInner}>
                <div className={styles.cardTop}>
                  <div className={`${styles.iconWrapper} ${styles.indigoAccent}`}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <path d="M8 21h8M12 17v4" />
                      <path d="M7 8l3 3-3 3M13 14h4" />
                    </svg>
                  </div>
                  <span className={styles.tagPill}>WORKFLOWS</span>
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{t.p1Title || 'AI Tools & Prompts'}</h3>
                  <p className={styles.cardDesc}>
                    {t.p1Desc || 'Practical AI tools, prompt generators, and department workflows for Bihar officers and citizens.'}
                  </p>
                </div>

                <div className={styles.cardAction}>
                  <span>{t.p1Link || 'Open AI Tools Page'}</span>
                  <span className={styles.arrow}>→</span>
                </div>
              </div>
            </article>

            {/* BENTO CARD 3: BLOG & INSIGHTS */}
            <article
              className={`${styles.bentoCard} ${styles.blogCard}`}
              onClick={() => navigate('/blog')}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className={styles.glareOverlay} />
              <div className={styles.cardInner}>
                <div className={styles.cardTop}>
                  <div className={`${styles.iconWrapper} ${styles.terracottaAccent}`}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10l5 5v9a2 2 0 0 1-2 2z" />
                      <path d="M14 2v4h4" />
                      <path d="M7 13h10" />
                      <path d="M7 17h6" />
                    </svg>
                  </div>
                  <span className={styles.tagPill}>ARTICLES</span>
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>Blog & Insights</h3>
                  <p className={styles.cardDesc}>
                    Official articles, case studies, AI policy updates, and deployment stories across Bihar.
                  </p>
                </div>

                <div className={styles.cardAction}>
                  <span>Open Blog Page</span>
                  <span className={styles.arrow}>→</span>
                </div>
              </div>
            </article>

            {/* BENTO CARD 4: STARTUPS */}
            <article
              className={`${styles.bentoCard} ${styles.startupCard}`}
              onClick={() => navigate('/startups')}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className={styles.glareOverlay} />
              <div className={styles.cardInner}>
                <div className={styles.cardTop}>
                  <div className={`${styles.iconWrapper} ${styles.mustardAccent}`}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </div>
                  <span className={styles.tagPill}>INNOVATION</span>
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>Startup Ecosystem</h3>
                  <p className={styles.cardDesc}>
                    Connecting Bihar's AI entrepreneurs with IndiaAI seed funding, mentorship, and government pilots.
                  </p>
                </div>

                <div className={styles.cardAction}>
                  <span>Open Startups Page</span>
                  <span className={styles.arrow}>→</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
