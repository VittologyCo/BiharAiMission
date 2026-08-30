import React, { useEffect, useRef, useState } from 'react';

/**
 * Luxury Brand-Aligned Mouse Follower with Precision Core,
 * Damped Magnetic Aura Halo, and Micro-Ember Particle Trail
 * Strictly disabled on mobile, tablet, touch, and smaller screen devices (<= 1024px).
 */
export default function CursorSpotlight() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const canvasRef = useRef(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const particles = useRef([]);
  const animFrameId = useRef(null);

  useEffect(() => {
    // Check if device is desktop with fine pointer and large viewport (> 1024px)
    const checkIsDesktop = () => {
      const isLargeScreen = window.innerWidth > 1024;
      const isPointerFine = window.matchMedia('(pointer: fine)').matches;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      return isLargeScreen && isPointerFine && !isTouchDevice && !prefersReducedMotion;
    };

    const validDesktop = checkIsDesktop();
    setIsEnabled(validDesktop);

    if (!validDesktop) return;

    const canvas = canvasRef.current;
    const ctx = canvas ? canvas.getContext('2d') : null;

    const handleResize = () => {
      const desktop = checkIsDesktop();
      setIsEnabled(desktop);
      if (canvas && desktop) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      const target = e.target;
      if (target) {
        // Detect interactive targets
        const isClickable = target.closest('a, button, select, input, textarea, [role="button"], .card, .pillar, .statCard, .nav-btn, .chip, [data-interactive="true"]');
        setIsHovered(!!isClickable);

        // Update spotlight variables on hovered card
        const card = target.closest('.card, .statCard, .bentoCard, .pillar, article, [data-spotlight="true"]');
        if (card) {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
          card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        }
      }

      // Spawn subtle warm micro-ember particles on movement
      if (Math.random() > 0.4 && particles.current.length < 24) {
        const colors = [
          'rgba(193, 85, 44, ',   // Terracotta
          'rgba(217, 155, 38, ',  // Sand Gold
          'rgba(226, 139, 92, ',  // Warm Apricot
        ];
        particles.current.push({
          x: e.clientX + (Math.random() - 0.5) * 8,
          y: e.clientY + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8 - 0.4,
          size: Math.random() * 2.2 + 1.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 0.75,
          life: 1.0,
          decay: Math.random() * 0.035 + 0.02
        });
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // 60FPS Physics Render Loop
    const render = () => {
      // 1. Direct Dot Position
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;
      }

      // 2. Smooth Lerp Elastic Halo Ring (Spring easing)
      const ease = 0.15;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * ease;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * ease;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      // 3. Render Canvas Micro-Embers
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = particles.current.length - 1; i >= 0; i--) {
          const p = particles.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= p.decay;

          if (p.life <= 0) {
            particles.current.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.alpha * p.life})`;
          ctx.fill();
        }
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isEnabled]);

  // Do not render anything on mobile or smaller screens (<= 1024px)
  if (!isEnabled) return null;

  return (
    <>
      {/* Particle Canvas for warm trailing embers */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 99998,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* Outer Smooth Elastic Halo Ring */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 99999,
          width: isHovered ? '48px' : isClicking ? '26px' : '34px',
          height: isHovered ? '48px' : isClicking ? '26px' : '34px',
          margin: isHovered ? '-24px 0 0 -24px' : isClicking ? '-13px 0 0 -13px' : '-17px 0 0 -17px',
          borderRadius: '50%',
          border: isHovered
            ? '1.5px solid rgba(226, 139, 92, 0.9)'
            : '1px solid rgba(193, 85, 44, 0.55)',
          background: isHovered
            ? 'radial-gradient(circle, rgba(193, 85, 44, 0.18) 0%, rgba(217, 155, 38, 0.06) 100%)'
            : 'radial-gradient(circle, rgba(193, 85, 44, 0.08) 0%, transparent 80%)',
          boxShadow: isHovered
            ? '0 0 20px rgba(193, 85, 44, 0.4), inset 0 0 10px rgba(217, 155, 38, 0.2)'
            : '0 0 12px rgba(193, 85, 44, 0.2)',
          opacity: isVisible ? 1 : 0,
          transition: 'width 0.22s cubic-bezier(0.16, 1, 0.3, 1), height 0.22s cubic-bezier(0.16, 1, 0.3, 1), margin 0.22s cubic-bezier(0.16, 1, 0.3, 1), background 0.22s ease, border-color 0.22s ease, opacity 0.25s ease',
          willChange: 'transform',
          mixBlendMode: 'screen'
        }}
      />

      {/* Inner Precision Core Dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 100000,
          width: isHovered ? '8px' : isClicking ? '12px' : '6px',
          height: isHovered ? '8px' : isClicking ? '12px' : '6px',
          margin: isHovered ? '-4px 0 0 -4px' : isClicking ? '-6px 0 0 -6px' : '-3px 0 0 -3px',
          borderRadius: '50%',
          backgroundColor: '#C1552C',
          boxShadow: '0 0 8px #D99B26, 0 0 16px rgba(193, 85, 44, 0.8)',
          opacity: isVisible ? 1 : 0,
          transition: 'width 0.15s ease, height 0.15s ease, margin 0.15s ease, transform 0.01s linear, opacity 0.2s ease',
          willChange: 'transform'
        }}
      />
    </>
  );
}
