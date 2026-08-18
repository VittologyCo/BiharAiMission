import React from 'react';

/**
 * Configuration object for a single Experience scene.
 * Each scene provides its own canvas content and HTML overlay.
 */
export interface SceneConfig {
  /** URL-safe identifier, used for deep-linking (/experience/:id) */
  id: string;

  /** Display name shown in the HUD and scene title */
  title: string;

  /** Hindi translation of the title */
  titleHi?: string;

  /** React component rendered on the canvas layer */
  CanvasContent: React.ComponentType<Partial<SceneCanvasProps>>;

  /** React component rendered on the overlay layer (HTML on top of canvas) */
  Overlay: React.ComponentType<Partial<SceneOverlayProps>>;

  /** How long this scene lasts in normalized scroll-units (default: 1) */
  duration?: number;

  /** Transition effect when entering this scene */
  transition?: TransitionType;

  /** Optional description for preloading hints or analytics */
  description?: string;
}

export type TransitionType = 'fade' | 'wipe-up' | 'wipe-left' | 'none';

/**
 * Props passed to every scene's canvas component.
 */
export interface SceneCanvasProps {
  /** Canvas 2D rendering context */
  ctx: CanvasRenderingContext2D | null;

  /** Canvas width in CSS pixels */
  width: number;

  /** Canvas height in CSS pixels */
  height: number;

  /** Device pixel ratio (capped at 2) */
  dpr: number;

  /** Normalized scroll progress within this scene (0–1) */
  scrollProgress: number;

  /** Whether reduced motion is preferred */
  reducedMotion: boolean;
}

/**
 * Props passed to every scene's overlay component.
 */
export interface SceneOverlayProps {
  /** Whether this scene is currently active */
  isActive: boolean;

  /** Animation phase of the scene */
  phase: AnimationPhase;

  /** Normalized scroll progress within this scene (0–1) */
  scrollProgress: number;
}

/** Animation phase of a scene's lifecycle */
export type AnimationPhase = 'entering' | 'active' | 'exiting' | 'idle';
