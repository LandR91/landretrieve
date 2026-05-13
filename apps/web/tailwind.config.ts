import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      // ─── COLORI ESATTI DALLA LANDING ────────────────────────────────────
      colors: {
        // Primary green
        green: {
          DEFAULT: '#26A55B',
          dark: '#1d8a4b',
          light: '#e8f7ef',
          xlight: '#f0fbf5',
          accessible: '#1a7a42',
        },
        // Testo
        text: {
          DEFAULT: '#111111',
          soft: '#374151',
          muted: '#4b5563',
        },
        // Struttura
        border: '#D4D4D4',
        bg: '#ffffff',
        light: '#f5f5f5',
        'footer-bg': '#CACACA',
        'dash-bg': '#CACACA',

        // shadcn/ui mappatura
        background: '#ffffff',
        foreground: '#111111',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#111111',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#111111',
        },
        primary: {
          DEFAULT: '#26A55B',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#f5f5f5',
          foreground: '#374151',
        },
        muted: {
          DEFAULT: '#f5f5f5',
          foreground: '#4b5563',
        },
        accent: {
          DEFAULT: '#e8f7ef',
          foreground: '#1a7a42',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        input: '#D4D4D4',
        ring: '#26A55B',
      },

      // ─── FONT ────────────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      // ─── BORDER RADIUS ───────────────────────────────────────────────────
      borderRadius: {
        none: '0',
        sm: '4px',
        DEFAULT: '6px',    // default bottoni
        md: '6px',
        lg: '8px',         // --radius (dropdown, compare bar)
        xl: '10px',        // card immobile/agente
        '2xl': '12px',     // card professionista
        full: '9999px',    // pill/badge
      },

      // ─── SPACING ─────────────────────────────────────────────────────────
      spacing: {
        'nav-h': '72px',
        'sidebar-w': '240px',
      },

      // ─── MAX WIDTH ───────────────────────────────────────────────────────
      maxWidth: {
        container: '1200px',
      },

      // ─── FONT SIZE ───────────────────────────────────────────────────────
      fontSize: {
        // Scale custom estratta dalla landing
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
        xs: ['0.72rem', { lineHeight: '1rem' }],
        sm: ['0.82rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.6' }],
        lg: ['1.05rem', { lineHeight: '1.6' }],
        xl: ['1.1rem', { lineHeight: '1.4' }],
        '2xl': ['1.25rem', { lineHeight: '1.3' }],
        '3xl': ['clamp(1.75rem, 3vw, 2.4rem)', { lineHeight: '1.15' }],
        '4xl': ['clamp(1.5rem, 3vw, 2rem)', { lineHeight: '1.2' }],
        hero: ['clamp(3rem, 7vw, 5.5rem)', { lineHeight: '1.2' }],
      },

      // ─── BOX SHADOW ──────────────────────────────────────────────────────
      boxShadow: {
        nav: '0 1px 0 #D4D4D4',
        card: '0 8px 24px rgba(0,0,0,0.1)',
        'card-prof': '0 16px 48px rgba(0,0,0,0.12)',
        dropdown: '0 8px 24px rgba(0,0,0,0.1)',
        compare: '0 8px 24px rgba(0,0,0,0.25)',
        search: '0 4px 20px rgba(0,0,0,0.06)',
        badge: '0 4px 16px rgba(0,0,0,0.1)',
        // No shadow su bottoni — mai
      },

      // ─── TRANSIZIONI ─────────────────────────────────────────────────────
      transitionDuration: {
        DEFAULT: '200ms',
        fast: '150ms',
        nav: '400ms',
        reveal: '300ms',
      },

      // ─── KEYFRAMES + ANIMAZIONI ──────────────────────────────────────────
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
      },

      // ─── BREAKPOINTS ─────────────────────────────────────────────────────
      screens: {
        sm: '640px',   // mobile breakpoint
        md: '768px',
        lg: '1024px',  // tablet breakpoint
        xl: '1200px',  // max-width container
        '2xl': '1400px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
