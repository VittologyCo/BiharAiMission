import { create } from 'zustand';
import type { AnimationPhase } from '../types/scene';
import type { NavigationDirection } from '../types/animation';

/**
 * Zustand store for the Experience module.
 *
 * Manages scene navigation, animation phase, scroll progress,
 * and user interaction tracking. Designed for high-frequency
 * reads from the canvas RAF loop via `subscribe`.
 */

interface ExperienceState {
  // ── Scene navigation ──────────────────────────────────────
  currentSceneIndex: number;
  totalScenes: number;
  phase: AnimationPhase;
  navigationDirection: NavigationDirection;

  // ── Animation control ─────────────────────────────────────
  isAnimating: boolean;
  scrollProgress: number;
  reducedMotion: boolean;

  // ── Interaction tracking ──────────────────────────────────
  interactions: Record<string, boolean>;

  // ── Actions ───────────────────────────────────────────────
  setTotalScenes: (total: number) => void;
  goToScene: (index: number) => void;
  nextScene: () => void;
  prevScene: () => void;
  setPhase: (phase: AnimationPhase) => void;
  setIsAnimating: (animating: boolean) => void;
  setScrollProgress: (progress: number) => void;
  setReducedMotion: (reduced: boolean) => void;
  recordInteraction: (key: string) => void;
  reset: () => void;
}

const initialState = {
  currentSceneIndex: 0,
  totalScenes: 0,
  phase: 'idle' as AnimationPhase,
  navigationDirection: 'forward' as NavigationDirection,
  isAnimating: false,
  scrollProgress: 0,
  reducedMotion: false,
  interactions: {},
};

export const useExperienceStore = create<ExperienceState>((set, get) => ({
  ...initialState,

  setTotalScenes: (total) => set({ totalScenes: total }),

  goToScene: (index) => {
    const { currentSceneIndex, totalScenes, isAnimating } = get();
    if (isAnimating || index < 0 || index >= totalScenes || index === currentSceneIndex) return;

    set({
      currentSceneIndex: index,
      navigationDirection: index > currentSceneIndex ? 'forward' : 'backward',
      phase: 'entering',
      scrollProgress: 0,
    });
  },

  nextScene: () => {
    const { currentSceneIndex, totalScenes, isAnimating } = get();
    if (isAnimating || currentSceneIndex >= totalScenes - 1) return;

    set({
      currentSceneIndex: currentSceneIndex + 1,
      navigationDirection: 'forward',
      phase: 'entering',
      scrollProgress: 0,
    });
  },

  prevScene: () => {
    const { currentSceneIndex, isAnimating } = get();
    if (isAnimating || currentSceneIndex <= 0) return;

    set({
      currentSceneIndex: currentSceneIndex - 1,
      navigationDirection: 'backward',
      phase: 'entering',
      scrollProgress: 0,
    });
  },

  setPhase: (phase) => set({ phase }),

  setIsAnimating: (animating) => set({ isAnimating: animating }),

  setScrollProgress: (progress) =>
    set({ scrollProgress: Math.max(0, Math.min(1, progress)) }),

  setReducedMotion: (reduced) => set({ reducedMotion: reduced }),

  recordInteraction: (key) =>
    set((state) => ({
      interactions: { ...state.interactions, [key]: true },
    })),

  reset: () => set(initialState),
}));
