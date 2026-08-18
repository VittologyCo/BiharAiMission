import type { ParticleSystemConfig } from './ParticleSystem.ts';

/**
 * Named particle system presets for the Experience.
 * Each preset is a complete ParticleSystemConfig tuned
 * for a specific visual effect.
 */

/** Neural network: calm blue nodes with subtle connections */
export const neuralNet: ParticleSystemConfig = {
  density: 3.5,
  colors: ['#C1552C', '#E28B5C', '#E8B23D', 'var(--color-line, #E2D7C3)'],
  minRadius: 1.5,
  maxRadius: 3,
  minOpacity: 0.3,
  maxOpacity: 0.7,
  minSpeed: 0.15,
  maxSpeed: 0.4,
  connectionDistance: 120,
  connectionColor: 'rgba(228, 217, 196, 0.25)',
  connectionOpacity: 0.25,
  lifetime: 0,
};

/** Data flow: faster, smaller particles suggesting data movement */
export const dataFlow: ParticleSystemConfig = {
  density: 5,
  colors: ['var(--color-charcoal-900, #181512)', '#FFFFFF'],
  minRadius: 0.8,
  maxRadius: 2,
  minOpacity: 0.2,
  maxOpacity: 0.5,
  minSpeed: 0.3,
  maxSpeed: 0.8,
  connectionDistance: 0,
  connectionColor: 'rgba(24, 21, 18, 0)',
  connectionOpacity: 0,
  lifetime: 8,
};

/** Ambient: very sparse, slow, large particles for atmosphere */
export const ambient: ParticleSystemConfig = {
  density: 1.2,
  colors: ['var(--color-charcoal-900, #181512)', '#E9F1FA', '#66d4f2'],
  minRadius: 2,
  maxRadius: 5,
  minOpacity: 0.08,
  maxOpacity: 0.2,
  minSpeed: 0.05,
  maxSpeed: 0.15,
  connectionDistance: 0,
  connectionColor: 'rgba(24, 21, 18, 0)',
  connectionOpacity: 0,
  lifetime: 0,
};
