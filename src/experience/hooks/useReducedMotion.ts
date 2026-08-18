import { useEffect } from 'react';
import { useExperienceStore } from '../store/experienceStore.ts';

/**
 * Detects `prefers-reduced-motion: reduce` and syncs
 * the value into the experience store. Also listens
 * for live changes to the media query.
 */
export function useReducedMotion(): boolean {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const setReducedMotion = useExperienceStore((s) => s.setReducedMotion);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const update = () => setReducedMotion(mq.matches);
    update();

    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [setReducedMotion]);

  return reducedMotion;
}
