import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export default function SmoothScroll() {
  const location = useLocation();

  useEffect(() => {
    // Disable smooth scroll on admin, isolated pages, or mobile touch devices to prevent scroll collision
    const isIsolated = location.pathname.startsWith('/admin') || location.pathname.startsWith('/experience');
    const isTouchMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || ('ontouchstart' in window && window.innerWidth < 1024));
    if (isIsolated || isTouchMobile) return;

    // Initialize Lenis with fast, fluid and natural momentum (zero lag/stickiness)
    const lenis = new Lenis({
      duration: 0.85,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.4,
      infinite: false,
      autoResize: true,
    });

    window.__lenis = lenis;

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Immediate scroll to top on route change
    lenis.scrollTo(0, { immediate: true });

    // Debounced resize to prevent layout thrashing
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        lenis.resize();
      }, 150);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete window.__lenis;
    };
  }, [location.pathname]);

  return null;
}
