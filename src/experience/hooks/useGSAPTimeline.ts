import { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';

/**
 * Creates a GSAP timeline that is automatically killed on unmount.
 * Returns a stable `getTimeline` function that lazily creates
 * the timeline on first call.
 *
 * Usage:
 *   const getTimeline = useGSAPTimeline({ defaults: { duration: 0.6 } });
 *   useEffect(() => {
 *     const tl = getTimeline();
 *     tl.fromTo(ref.current, { opacity: 0 }, { opacity: 1 });
 *   }, [getTimeline]);
 */
export function useGSAPTimeline(
  vars?: gsap.TimelineVars
): () => gsap.core.Timeline {
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const getTimeline = useCallback(() => {
    if (!tlRef.current) {
      tlRef.current = gsap.timeline(vars);
    }
    return tlRef.current;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (tlRef.current) {
        tlRef.current.kill();
        tlRef.current = null;
      }
    };
  }, []);

  return getTimeline;
}
