import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useExperienceStore } from '../store/experienceStore.ts';
import styles from './SceneTitle.module.css';

interface SceneTitleProps {
  title: string;
  subtitle?: string;
}

/**
 * Animated scene title component. Fades and slides in
 * when a new scene enters, using GSAP for orchestration.
 */
const SceneTitle: React.FC<SceneTitleProps> = ({ title, subtitle }) => {
  const phase = useExperienceStore((s) => s.phase);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (phase !== 'entering' && phase !== 'active') return;

    const tl = gsap.timeline();
    const duration = reducedMotion ? 0.05 : 0.8;
    const stagger = reducedMotion ? 0 : 0.15;

    tl.fromTo(
      titleRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration, ease: 'power3.out' }
    );

    if (subtitleRef.current) {
      tl.fromTo(
        subtitleRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: duration * 0.8, ease: 'power3.out' },
        `>-${stagger}`
      );
    }

    return () => {
      tl.kill();
    };
  }, [phase, reducedMotion]);

  return (
    <div ref={containerRef} className={styles.container}>
      <h1 ref={titleRef} className={styles.title}>
        {title}
      </h1>
      {subtitle && (
        <p ref={subtitleRef} className={styles.subtitle}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SceneTitle;
