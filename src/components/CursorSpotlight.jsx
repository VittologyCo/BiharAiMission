import { useEffect, useState } from 'react';

export default function CursorSpotlight() {
  const [position, setPosition] = useState({ x: -200, y: -200 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target;
      if (!target) return;

      // Check if cursor is over clickable elements
      if (
        target.closest('a, button, select, input, .card, .pillar, .cc, .pb, .p-tab, .t-btn, .pr-box, .lpill button, .p-lnk, [onclick]')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }

      // Track cursor position inside cards for radial spotlight & illuminated border effect
      const card = target.closest(
        '.card, .bentoCard, .caseCard, .statCard, .ctaCard, .pillar, .course-card, .tool-card, article, [data-spotlight="true"]'
      );
      if (card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  return (
    <>
      {/* Precision Interactive Cursor Dot */}
      <div
        id="cursor-dot"
        className={isHovered ? 'hovered' : ''}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          opacity: isVisible ? 1 : 0,
        }}
      />
    </>
  );
}
