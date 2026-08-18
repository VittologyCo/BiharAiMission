import { useRef, useEffect, useCallback, useState } from 'react';

/**
 * Manages a `<canvas>` element: provides the 2D context,
 * handles resize with DPR awareness, and exposes dimensions.
 *
 * Usage:
 *   const { canvasRef, ctx, width, height, dpr } = useCanvasContext();
 *   <canvas ref={canvasRef} />
 */
export function useCanvasContext() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, dpr: 1 });

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = parent.clientWidth;
    const height = parent.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext('2d');
    if (context) {
      context.scale(dpr, dpr);
      setCtx(context);
    }

    setDimensions({ width, height, dpr });
  }, []);

  useEffect(() => {
    resize();

    const observer = new ResizeObserver(resize);
    const parent = canvasRef.current?.parentElement;
    if (parent) observer.observe(parent);

    return () => observer.disconnect();
  }, [resize]);

  return {
    canvasRef,
    ctx,
    width: dimensions.width,
    height: dimensions.height,
    dpr: dimensions.dpr,
  };
}
