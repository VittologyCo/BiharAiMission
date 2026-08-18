import React, { useEffect, useRef, useCallback } from 'react';
import { useCanvasContext } from '../hooks/useCanvasContext.ts';
import { useExperienceStore } from '../store/experienceStore.ts';
import type { RenderCallback } from '../types/animation.ts';

interface CanvasRendererProps {
  /** Render callback invoked on each animation frame */
  onRender: RenderCallback;
  /** Optional className for the canvas wrapper */
  className?: string;
}

/**
 * Full-viewport canvas component with DPR-aware sizing,
 * a managed requestAnimationFrame loop, and automatic cleanup.
 *
 * The render callback receives the 2D context, dimensions,
 * DPR, and delta time (seconds since last frame).
 */
const CanvasRenderer: React.FC<CanvasRendererProps> = ({ onRender, className }) => {
  const { canvasRef, ctx, width, height, dpr } = useCanvasContext();
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const onRenderRef = useRef(onRender);

  // Keep render callback ref current without re-triggering effects
  useEffect(() => {
    onRenderRef.current = onRender;
  }, [onRender]);

  const loop = useCallback(
    (time: number) => {
      if (!ctx || !width || !height) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const deltaTime = lastTimeRef.current
        ? (time - lastTimeRef.current) / 1000
        : 0.016;
      lastTimeRef.current = time;

      // Clear the canvas each frame
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, width * dpr, height * dpr);
      ctx.restore();

      onRenderRef.current(ctx, width, height, dpr, deltaTime);

      if (!reducedMotion) {
        rafRef.current = requestAnimationFrame(loop);
      }
    },
    [ctx, width, height, dpr, reducedMotion]
  );

  useEffect(() => {
    if (reducedMotion) {
      // Render a single frame for reduced motion
      if (ctx && width && height) {
        onRenderRef.current(ctx, width, height, dpr, 0);
      }
      return;
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loop, reducedMotion, ctx, width, height, dpr]);

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 1,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

export default CanvasRenderer;
