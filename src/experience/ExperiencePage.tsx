import React, { useEffect } from 'react';
import ExperienceLayout from './ExperienceLayout.tsx';
import { useReducedMotion } from './hooks/useReducedMotion.ts';
import { useExperienceStore } from './store/experienceStore.ts';

/**
 * ExperiencePage — root page component for the /experience route.
 *
 * Initializes the experience state, detects reduced motion,
 * and mounts the layered ExperienceLayout. This component is
 * lazy-loaded via React.lazy() in App.js.
 */
const ExperiencePage: React.FC = () => {
  const reset = useExperienceStore((s) => s.reset);
  const setPhase = useExperienceStore((s) => s.setPhase);

  // Detect and sync reduced motion preference
  useReducedMotion();

  // Initialize experience on mount, clean up on unmount
  useEffect(() => {
    // Start the first scene's enter animation
    setPhase('entering');

    return () => {
      reset();
    };
  }, [setPhase, reset]);

  return <ExperienceLayout />;
};

export default ExperiencePage;
