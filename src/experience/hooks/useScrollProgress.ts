import { useEffect, useRef, useCallback } from 'react';
import { useExperienceStore } from '../store/experienceStore';

/**
 * Tracks scroll progress within the Experience page and
 * normalizes it to a 0–1 value in the store.
 *
 * @param containerRef - ref to the scrollable container element
 */
export function useScrollProgress(
  containerRef: React.RefObject<HTMLElement | null>
): number {
  const scrollProgress = useExperienceStore((s) => s.scrollProgress);
  const setScrollProgress = useExperienceStore((s) => s.setScrollProgress);
  const rafRef = useRef<number>(0);

  const handleScroll = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = containerRef.current;
      if (!el) return;

      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

      setScrollProgress(progress);
    });
  }, [containerRef, setScrollProgress]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef, handleScroll]);

  return scrollProgress;
}
