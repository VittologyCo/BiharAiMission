import React, { useRef, useCallback, useEffect } from 'react';
import { ParticleSystem } from '../../canvas/particles/ParticleSystem.ts';
import { neuralNet } from '../../canvas/particles/presets.ts';
import { GradientField } from '../../canvas/backgrounds/GradientField.ts';
import CanvasRenderer from '../../canvas/CanvasRenderer.tsx';
import type { RenderCallback } from '../../types/animation.ts';

/**
 * Welcome Scene — canvas layer.
 *
 * Renders a calm neural-network particle field over
 * slowly shifting gradient backgrounds. This is the
 * first thing visitors see when entering the Experience.
 */
const WelcomeScene: React.FC = () => {
  const psRef = useRef<ParticleSystem | null>(null);
  const bgRef = useRef<GradientField | null>(null);
  const lastSizeRef = useRef({ w: 0, h: 0 });

  // Lazy-init particle system and gradient field
  useEffect(() => {
    psRef.current = new ParticleSystem(neuralNet);
    bgRef.current = new GradientField({
      colors: [
        'rgba(24, 21, 18, 0.12)',
        'rgba(10, 22, 40, 0.9)',
        'rgba(0, 139, 186, 0.08)',
      ],
      speed: 0.4,
    });

    return () => {
      psRef.current = null;
      bgRef.current = null;
    };
  }, []);

  const handleRender: RenderCallback = useCallback(
    (ctx, width, height, dpr, deltaTime) => {
      // Reinitialize particles on resize
      if (
        psRef.current &&
        (width !== lastSizeRef.current.w || height !== lastSizeRef.current.h)
      ) {
        psRef.current.init(width, height);
        lastSizeRef.current = { w: width, h: height };
      }

      // Fill dark base
      ctx.fillStyle = '#0a1628';
      ctx.fillRect(0, 0, width, height);

      // Animated gradient background
      if (bgRef.current) {
        bgRef.current.update(deltaTime);
        bgRef.current.draw(ctx, width, height);
      }

      // Particle system
      if (psRef.current) {
        psRef.current.update(deltaTime);
        psRef.current.draw(ctx, width, height);
      }
    },
    []
  );

  return <CanvasRenderer onRender={handleRender} />;
};

export default WelcomeScene;
