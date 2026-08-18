import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import { useExperienceStore } from '../../store/experienceStore.ts';
import SceneTitle from '../../overlay/SceneTitle.tsx';
import styles from './WelcomeScene.module.css';

/**
 * Welcome Scene — overlay layer.
 *
 * Renders the mission intro text and CTAs on top of
 * the canvas. All content animates in via GSAP when
 * the scene enters.
 */
const WelcomeOverlay: React.FC = () => {
  const phase = useExperienceStore((s) => s.phase);
  const nextScene = useExperienceStore((s) => s.nextScene);
  const totalScenes = useExperienceStore((s) => s.totalScenes);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const navigate = useNavigate();

  const contentRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase !== 'entering' && phase !== 'active') return;

    const dur = reducedMotion ? 0.05 : 0.7;

    const tl = gsap.timeline({ delay: reducedMotion ? 0 : 0.3 });

    if (tagRef.current) {
      tl.fromTo(
        tagRef.current,
        { y: 15, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: dur * 0.6, ease: 'power3.out' }
      );
    }

    // Title is animated by SceneTitle component

    if (contentRef.current) {
      tl.fromTo(
        contentRef.current,
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: dur, ease: 'power3.out' },
        '>-0.2'
      );
    }

    if (ctaRef.current) {
      tl.fromTo(
        ctaRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: dur * 0.8, ease: 'power3.out' },
        '>-0.15'
      );
    }

    return () => {
      tl.kill();
    };
  }, [phase, reducedMotion]);

  return (
    <div className={styles.overlay}>
      <div className={styles.center}>
        <div ref={tagRef} className={styles.tag}>
          <span className={styles.tagDot} />
          Interactive Experience
        </div>

        <SceneTitle
          title="Discover Bihar's AI Future"
          subtitle="An interactive journey through how artificial intelligence is transforming education, governance, and opportunity across Bihar."
        />

        <div ref={contentRef} className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>130M+</span>
            <span className={styles.statLabel}>Citizens impacted</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNumber}>38</span>
            <span className={styles.statLabel}>Districts connected</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNumber}>5</span>
            <span className={styles.statLabel}>AI Pillars</span>
          </div>
        </div>

        <div ref={ctaRef} className={styles.ctas}>
          {totalScenes > 1 && (
            <button className={styles.primaryBtn} onClick={() => nextScene()}>
              Begin the Journey
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          )}
          <button className={styles.secondaryBtn} onClick={() => navigate('/')}>
            Explore the Website
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeOverlay;
