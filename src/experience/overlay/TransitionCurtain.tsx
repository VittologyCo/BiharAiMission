import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useExperienceStore } from '../store/experienceStore.ts';
import styles from './TransitionCurtain.module.css';

/**
 * Full-screen transition overlay between scenes.
 * Fades in, then fades out after the scene switch completes.
 */
const TransitionCurtain: React.FC = () => {
  const phase = useExperienceStore((s) => s.phase);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const curtainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase !== 'entering' || !curtainRef.current) return;

    const duration = reducedMotion ? 0.05 : 0.35;

    const tl = gsap.timeline();
    tl.fromTo(
      curtainRef.current,
      { opacity: 0.8 },
      { opacity: 0, duration, ease: 'power2.out', delay: duration }
    );

    return () => {
      tl.kill();
    };
  }, [phase, reducedMotion]);

  return (
    <div
      ref={curtainRef}
      className={styles.curtain}
      style={{ opacity: 0, pointerEvents: 'none' }}
    />
  );
};

export default TransitionCurtain;
