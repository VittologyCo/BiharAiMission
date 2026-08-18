// ============================================================================
// BIHAR AI MISSION - LUXURY CIVIC DESIGN SYSTEM (design.md)
// Source of truth for JS constants (Zero Blue / Zero Purple / Zero Navy)
// ============================================================================

export const PALETTE = {
  // Deep Espresso & Charcoal (Zero Blue/Navy/Purple)
  ink: '#181512',
  charcoal900: '#181512',
  charcoal800: '#231F1B',
  indigo900: '#181512',
  indigo600: '#231F1B',

  // Madhubani Terracotta Accents
  terracotta600: '#A3411B',
  terracotta500: '#C1552C',
  terracotta300: '#E28B5C',

  // Golden Ochre
  mustard400: '#D99B26',
  ochre400: '#D99B26',

  // Surfaces & Backgrounds
  sand50: '#FBF8F3',
  sand100: '#F3ECE0',
  line: '#E2D7C3',

  // Typography Colors
  inkMuted: '#5E554D',
  textOnDark: '#FBF8F3',
  textMutedOnDark: '#C8BFB3',

  // Status Colors
  success: '#2D6A4F',
  error: '#B3341C',

  // Gradients
  heroGradient: 'linear-gradient(135deg, #181512 0%, #231F1B 100%)',

  // Legacy Aliases
  bgDark: '#181512',
  bgSecondary: '#231F1B',
  accentPrimary: '#C1552C',
  accentSecondary: '#E28B5C',
  primaryText: '#181512',
  secondaryText: '#5E554D',
  mutedText: '#5E554D'
};

export const TYPOGRAPHY = {
  fontDisplay: "'Fraunces', 'Libre Bodoni', ui-serif, Georgia, serif",
  fontBody: "'General Sans', 'Public Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  fontMono: "'Fira Code', monospace",

  scale: {
    heroH1: {
      fontSize: 'clamp(3.5rem, 6vw, 4.75rem)',
      fontWeight: 600,
      lineHeight: 1.05,
      letterSpacing: '-0.025em'
    },
    sectionH2: {
      fontSize: 'clamp(2.25rem, 4vw, 2.85rem)',
      fontWeight: 600,
      lineHeight: 1.15,
      letterSpacing: '-0.02em'
    },
    cardH3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.3
    },
    body: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.62
    },
    small: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.4
    }
  }
};

export const RADIUS = {
  sm: '10px',
  lg: '20px'
};

export const SHADOWS = {
  soft: '0 10px 30px -10px rgba(24, 21, 18, 0.08)',
  hover: '0 20px 40px -12px rgba(193, 85, 44, 0.14)'
};

export const SPACING = {
  base: 8,
  maxWidthContent: '1200px',
  maxWidthCanvas: '1440px',
  section: 'clamp(3.5rem, 8vw, 8.75rem)',
  sectionDesktop: '8.75rem',
  sectionMobile: '3.5rem'
};

export function applyPaletteToDom() {}