import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useLanguage } from '../../hooks/useLanguage';
import styles from './Pillars.module.css';

export default function Pillars() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const isHi = lang === 'hi';

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
              { opacity: 0, y: 32, scale: 0.98 },
              { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out' }
            );
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // 3D Magnetic Parallax Tilt & Specular Light Handlers
  const handleMouseMove = (e) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const rotateX = (0.5 - py) * 12;
    const rotateY = (px - 0.5) * 12;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(0, -6px, 12px)`;
    card.style.setProperty('--glare-x', `${px * 100}%`);
    card.style.setProperty('--glare-y', `${py * 100}%`);
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)';
  };

  return (
    <section className={styles.pillarsSection} ref={sectionRef} id="pillars" aria-label="Core Focus Pillars">
      <div className={styles.container}>
        {/* Double-Bezel Outer Container */}
        <div className={styles.pillarsBox}>
          {/* Subtle Ambient Background Accents */}
          <div className={styles.bgGlowOrbTop} aria-hidden="true" />
          <div className={styles.bgGlowOrbBottom} aria-hidden="true" />

          {/* Section Header */}
          <div className={styles.header}>
            <div className={styles.sectionBadge}>
              <span className={styles.beaconDot} />
              <span className={styles.badgeLine} />
              <span>{t.pilEye || 'CORE FOCUS PILLARS · 4 FOUNDATIONAL TRACKS'}</span>
            </div>
            <h2 className={styles.title}>
              {isHi ? (
                <>बिहार के <span className={styles.accentText}>AI इकोसिस्टम</span> का निर्माण</>
              ) : (
                <>Building Bihar's <span className={styles.accentText}>AI Ecosystem</span></>
              )}
            </h2>
            <p className={styles.subtitle}>
              {t.pilSub || 'A high-level overview of our mission. Click on any section below to visit its dedicated page with complete, detailed information and interactive tools.'}
            </p>
          </div>

          {/* Asymmetric Bento Grid with 3D Parallax Tilt */}
          <div className={styles.bentoGrid}>
            
            {/* ═════ BENTO CARD 1: LEARNING HUB (Spans 7 cols) ═════ */}
            <article
              className={`${styles.bentoCard} ${styles.learningCard}`}
              onClick={() => navigate('/learning')}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className={styles.borderBeam} />
              <div className={styles.glareOverlay} />
              <div className={styles.cardInner}>
                <div className={styles.cardTop}>
                  <div className={`${styles.iconWrapper} ${styles.terracottaAccent}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 10v6M2 10l10-7 10 7-10 7-10-7z" />
                      <path d="M6 12v5c3.33 2 4.67 2 6 2s2.67 0 6-2v-5" />
                    </svg>
                  </div>
                  <div className={styles.tagGroup}>
                    <span className={styles.livePulse}>●</span>
                    <span className={styles.tagPill}>{isHi ? 'निःशुल्क कौशल एवं प्रमाणपत्र' : 'FREE SKILLS & CERTIFICATES'}</span>
                  </div>
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{t.p2Title || 'AI Learning Hub'}</h3>
                  <p className={styles.cardDesc}>
                    {t.p2Desc || 'Free bilingual courses, certificates, and hands-on modules inspired by IndiaAI FutureSkills for students and officers.'}
                  </p>

                  {/* Interactive Mini-Telemetry Chips */}
                  <div className={styles.telemetryStrip}>
                    <span className={styles.telemetryChip}>
                      <span className={styles.chipIcon}>📚</span>
                      <span>{isHi ? '12+ मॉड्यूल लाइव' : '12+ Modules Live'}</span>
                    </span>
                    <span className={styles.telemetryChip}>
                      <span className={styles.chipIcon}>🌐</span>
                      <span>{isHi ? 'हिंदी + English' : 'Hindi + English'}</span>
                    </span>
                    <span className={styles.telemetryChip}>
                      <span className={styles.chipIcon}>📜</span>
                      <span>{isHi ? 'सत्यापित प्रमाणपत्र' : 'Verified Certificate'}</span>
                    </span>
                  </div>
                </div>

                <div className={styles.cardAction}>
                  <span className={styles.actionLabel}>{t.p2Link || (isHi ? 'लर्निंग हब एक्सप्लोर करें' : 'Explore Learning Hub')}</span>
                  <span className={styles.actionBadge}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </article>

            {/* ═════ BENTO CARD 2: AI TOOLS & PROMPTS (Spans 5 cols) ═════ */}
            <article
              className={`${styles.bentoCard} ${styles.toolsCard}`}
              onClick={() => navigate('/tools')}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className={styles.borderBeam} />
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
                  <span className={styles.tagPill}>{isHi ? 'उत्पादकता इंजन' : 'WORKFLOWS & SUITE'}</span>
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{t.p1Title || 'AI Tools & Prompts'}</h3>
                  <p className={styles.cardDesc}>
                    {t.p1Desc || 'Practical AI tools, prompt generators, and department workflows for Bihar officers and citizens.'}
                  </p>

                  {/* Terminal Prompt Simulator */}
                  <div className={styles.terminalPrompt}>
                    <div className={styles.terminalHeader}>
                      <span className={styles.termDotRed} />
                      <span className={styles.termDotYellow} />
                      <span className={styles.termDotGreen} />
                      <span className={styles.termTitle}>ai-workflow.sh</span>
                    </div>
                    <div className={styles.termLine}>
                      <span className={styles.termPrompt}>$</span>
                      <span className={styles.termCmd}>generate-workflow --dept="Revenue & Agri"</span>
                      <span className={styles.termCursor}>_</span>
                    </div>
                  </div>
                </div>

                <div className={styles.cardAction}>
                  <span className={styles.actionLabel}>{t.p1Link || (isHi ? 'AI टूल्स एक्सप्लोर करें' : 'Explore AI Tools')}</span>
                  <span className={styles.actionBadge}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </article>

            {/* ═════ BENTO CARD 3: BLOG & INSIGHTS (Spans 6 cols) ═════ */}
            <article
              className={`${styles.bentoCard} ${styles.blogCard}`}
              onClick={() => navigate('/blog')}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className={styles.borderBeam} />
              <div className={styles.glareOverlay} />
              <div className={styles.cardInner}>
                <div className={styles.cardTop}>
                  <div className={`${styles.iconWrapper} ${styles.coralAccent}`}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10l5 5v9a2 2 0 0 1-2 2z" />
                      <path d="M14 2v4h4" />
                      <path d="M7 13h10" />
                      <path d="M7 17h6" />
                    </svg>
                  </div>
                  <span className={styles.tagPill}>{isHi ? 'अनुसंधान एवं नीति' : 'POLICY & ARTICLES'}</span>
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{isHi ? 'ब्लॉग एवं अंतर्दृष्टि' : 'Blog & Insights'}</h3>
                  <p className={styles.cardDesc}>
                    {isHi
                      ? 'आधिकारिक लेख, केस स्टडी, AI नीति अपडेट और बिहार भर में सफल कार्यान्वयन की कहानियां।'
                      : 'Official articles, case studies, AI policy updates, and deployment stories across Bihar.'}
                  </p>

                  {/* Featured Insight Pill */}
                  <div className={styles.featuredStoryPill}>
                    <span className={styles.storySpark}>✦</span>
                    <span className={styles.storyText}>{isHi ? 'केस स्टडी: बाढ़ नियंत्रण एवं पंचायती राज में AI' : 'Case Study: AI In Flood Alert & Governance'}</span>
                    <span className={styles.readTime}>4m</span>
                  </div>
                </div>

                <div className={styles.cardAction}>
                  <span className={styles.actionLabel}>{t.p3Link || (isHi ? 'लेख और नीतियां पढ़ें' : 'Read Articles & Policy')}</span>
                  <span className={styles.actionBadge}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </article>

            {/* ═════ BENTO CARD 4: STARTUP ECOSYSTEM (Spans 6 cols) ═════ */}
            <article
              className={`${styles.bentoCard} ${styles.startupCard}`}
              onClick={() => navigate('/startups')}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className={styles.borderBeam} />
              <div className={styles.glareOverlay} />
              <div className={styles.cardInner}>
                <div className={styles.cardTop}>
                  <div className={`${styles.iconWrapper} ${styles.mustardAccent}`}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </div>
                  <span className={styles.tagPill}>{isHi ? 'इनोवेशन एवं ग्रांट्स' : 'INNOVATION & GRANTS'}</span>
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{t.p4Title || (isHi ? 'स्टार्टअप इकोसिस्टम' : 'Startup Ecosystem')}</h3>
                  <p className={styles.cardDesc}>
                    {t.p4Desc || "Connecting Bihar's AI entrepreneurs with IndiaAI seed funding, mentorship, and government pilots."}
                  </p>

                  {/* Live Fund & District Network Metrics */}
                  <div className={styles.startupMetrics}>
                    <div className={styles.metricItem}>
                      <span className={styles.metricVal}>₹100 Cr</span>
                      <span className={styles.metricLbl}>{isHi ? 'IndiaAI कॉर्पस' : 'IndiaAI Corpus'}</span>
                    </div>
                    <div className={styles.metricDivider} />
                    <div className={styles.metricItem}>
                      <span className={styles.metricVal}>38</span>
                      <span className={styles.metricLbl}>{isHi ? 'जिले इनक्यूबेशन' : 'Districts Network'}</span>
                    </div>
                    <div className={styles.metricDivider} />
                    <div className={styles.metricItem}>
                      <span className={styles.metricVal}>2026</span>
                      <span className={styles.metricLbl}>{isHi ? 'पहला कॉहोर्ट' : 'Cohort 1'}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.cardAction}>
                  <span className={styles.actionLabel}>{t.p4Link || (isHi ? 'स्टार्टअप्स से जुड़ें' : 'Connect with Startups')}</span>
                  <span className={styles.actionBadge}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </article>

          </div>
        </div>
      </div>
    </section>
  );
}
