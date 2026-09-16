import React, { useEffect, useRef } from 'react';

/**
 * Ambient Animated Particle Network
 * Drifts smoothly and constantly behind all content sections.
 * Mouse-pointer follow physics are completely removed as requested.
 */
export default function InteractiveBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const colors = ['#C1552C', '#E28B5C', '#D99B26', '#E2D7C3'];

    const initCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      particles = [];

      const isMobile = width < 768;
      const numParticles = isMobile
        ? Math.min(32, Math.max(18, Math.floor((width * height) / 28000)))
        : Math.min(75, Math.max(45, Math.floor((width * height) / 18000)));

      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * (isMobile ? 0.35 : 0.45),
          vy: (Math.random() - 0.5) * (isMobile ? 0.35 : 0.45),
          radius: Math.random() * 2.2 + 1.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.35 + 0.2,
          pulseSpeed: Math.random() * 0.02 + 0.008,
          pulseAngle: Math.random() * Math.PI * 2
        });
      }
    };

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const isMobile = width < 768;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Smooth natural floating drift
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around screen edges smoothly
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Pulse opacity slightly for breathing effect
        p.pulseAngle += p.pulseSpeed;
        const currentAlpha = p.alpha + Math.sin(p.pulseAngle) * 0.1;

        // Draw particle dot with subtle warm glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.12, Math.min(0.75, currentAlpha));
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.radius * 2;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connect nearby drifting particles with delicate constellation lines
        const connectDistance = isMobile ? 85 : 120;
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectDistance) {
            const lineAlpha = (1 - dist / connectDistance) * (isMobile ? 0.1 : 0.16);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(226, 215, 195, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    initCanvas();
    render();

    window.addEventListener('resize', initCanvas);

    return () => {
      window.removeEventListener('resize', initCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="global-particle-background"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  );
}
