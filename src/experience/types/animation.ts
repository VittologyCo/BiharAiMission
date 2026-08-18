/**
 * Animation-related type definitions for the Experience module.
 */

/** Timeline configuration passed to GSAP */
export interface TimelineConfig {
  /** Duration in seconds */
  duration: number;

  /** GSAP easing string */
  ease?: string;

  /** Delay before starting */
  delay?: number;

  /** Whether this timeline should repeat */
  repeat?: number;

  /** Yoyo on repeat */
  yoyo?: boolean;
}

/** Phase of the overall Experience */
export type ExperiencePhase =
  | 'loading'
  | 'entering'
  | 'active'
  | 'transitioning'
  | 'exiting';

/** Direction of scene navigation */
export type NavigationDirection = 'forward' | 'backward';

/** Canvas render loop callback signature */
export type RenderCallback = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dpr: number,
  deltaTime: number
) => void;
