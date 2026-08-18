import { useEffect, useCallback, useRef } from 'react';
import gsap from 'gsap';
import { useExperienceStore } from '../store/experienceStore.ts';
import type { SceneConfig, AnimationPhase } from '../types/scene.ts';

/**
 * Manages scene lifecycle transitions: enter → active → exit.
 * Coordinates GSAP timelines for scene transitions and updates
 * the store phase accordingly.
 *
 * @param scenes - The full scene registry
 */
export function useSceneManager(scenes: SceneConfig[]) {
  const currentSceneIndex = useExperienceStore((s) => s.currentSceneIndex);
  const phase = useExperienceStore((s) => s.phase);
  const setPhase = useExperienceStore((s) => s.setPhase);
  const setIsAnimating = useExperienceStore((s) => s.setIsAnimating);
  const setTotalScenes = useExperienceStore((s) => s.setTotalScenes);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);

  const enterTlRef = useRef<gsap.core.Timeline | null>(null);

  // Sync total scenes count on mount
  useEffect(() => {
    setTotalScenes(scenes.length);
  }, [scenes.length, setTotalScenes]);

  // Handle phase transitions
  useEffect(() => {
    if (phase === 'entering') {
      setIsAnimating(true);

      // Kill any existing enter timeline
      if (enterTlRef.current) {
        enterTlRef.current.kill();
      }

      const duration = reducedMotion ? 0.1 : 0.6;

      enterTlRef.current = gsap.timeline({
        onComplete: () => {
          setPhase('active');
          setIsAnimating(false);
        },
      });

      // The actual enter animation is driven by scene components
      // via CSS classes tied to the phase. This timeline just
      // manages the timing.
      enterTlRef.current.to({}, { duration });
    }

    return () => {
      if (enterTlRef.current) {
        enterTlRef.current.kill();
        enterTlRef.current = null;
      }
    };
  }, [phase, currentSceneIndex, reducedMotion, setPhase, setIsAnimating]);

  const currentScene = scenes[currentSceneIndex] || null;

  return {
    currentScene,
    currentSceneIndex,
    phase,
    totalScenes: scenes.length,
  };
}
