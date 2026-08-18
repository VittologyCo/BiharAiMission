import React, { useEffect, useRef } from 'react';

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
    let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, isHovering: false };

    const colors = ['#C1552C', '#E28B5C', '#D99B26', '#E2D7C3'];

    const initCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      particles = [];

      const isMobile = width < 768;
      const numParticles = isMobile
        ? Math.min(22, Math.floor((width * height) / 35000))
        : Math.min(50, Math.floor((width * height) / 22000));

      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          originX: Math.random() * width,
          originY: Math.random() * height,
          vx: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.5),
          vy: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.5),
          radius: Math.random() * 2 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.35 + 0.15,
          pulseSpeed: Math.random() * 0.02 + 0.008,
          pulseAngle: Math.random() * Math.PI * 2
        });
      }
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isHovering = true;
    };

    const handleMouseLeave = () => {
      mouse.isHovering = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
        mouse.isHovering = true;
      }
    };

    const handleTouchEnd = () => {
      mouse.isHovering = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const isMobile = width < 768;

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.15;
      mouse.y += (mouse.targetY - mouse.y) * 0.15;

      const interactiveRadius = isMobile ? 90 : 140;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Standard drift movement
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around screen edges smoothly
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Interactive mouse physics
        if (mouse.isHovering) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < interactiveRadius && dist > 0) {
            // Subtle interactive push/pull effect
            const force = (interactiveRadius - dist) / interactiveRadius;
            const angle = Math.atan2(dy, dx);
            p.x += Math.cos(angle) * force * 2.5;
            p.y += Math.sin(angle) * force * 2.5;

            // Connect mouse to particle with subtle warm line
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(193, 85, 44, ${0.22 * force})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Pulse opacity slightly
        p.pulseAngle += p.pulseSpeed;
        const currentAlpha = p.alpha + Math.sin(p.pulseAngle) * 0.08;

        // Draw particle dot with subtle warm glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.1, Math.min(0.7, currentAlpha));
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.radius * 2;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connect nearby particles
        if (!isMobile) {
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 100) {
              const lineAlpha = (1 - dist / 100) * 0.12;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(226, 215, 195, ${lineAlpha})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    initCanvas();
    render();

    window.addEventListener('resize', initCanvas);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('resize', initCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  );
}
