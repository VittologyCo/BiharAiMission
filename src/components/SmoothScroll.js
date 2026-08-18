import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export default function SmoothScroll() {
  const location = useLocation();

  useEffect(() => {
    // Disable smooth scroll on admin or isolated canvas pages
    const isIsolated = location.pathname.startsWith('/admin') || location.pathname.startsWith('/experience');
    if (isIsolated) return;

    // Initialize Lenis Smooth Scroll Instance
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing curve for fluid momentum
      direction: 'vertical',
      gestureDirection: 'vertical',
      smoothTouch: false, // Keep native touch scroll on mobile devices for fast performance
      touchMultiplier: 1.8,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    // Immediate scroll to top on route change
    lenis.scrollTo(0, { immediate: true });

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [location.pathname]);

  return null;
}
