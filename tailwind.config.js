/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  corePlugins: {
    preflight: false, // Prevent clobbering existing CSS rules
  },
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#181512',
          muted: '#5E554D',
        },
        charcoal: {
          900: '#181512',
          800: '#231F1B',
        },
        terracotta: {
          600: '#A3411B',
          500: '#C1552C',
          300: '#E28B5C',
        },
        mustard: {
          400: '#D99B26',
        },
        ochre: {
          400: '#D99B26',
        },
        sand: {
          50: '#FBF8F3',
          100: '#F3ECE0',
        },
        line: '#E2D7C3',
        success: '#2D6A4F',
        error: '#B3341C',
      },
      fontFamily: {
        display: ['Fraunces', 'Libre Bodoni', 'ui-serif', 'Georgia', 'serif'],
        body: ['General Sans', 'Public Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      borderRadius: {
        sm: '10px',
        lg: '20px',
      },
      boxShadow: {
        soft: '0 10px 30px -10px rgba(24, 21, 18, 0.08)',
        hover: '0 20px 40px -12px rgba(193, 85, 44, 0.14)',
      },
    },
  },
  plugins: [],
};
