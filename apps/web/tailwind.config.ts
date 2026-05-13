import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // LandRetrieve brand
        green: {
          DEFAULT: '#26A55B',
          dark: '#1d8a4b',
          light: '#e8f7ef',
          xlight: '#f0fbf5',
          accessible: '#1a7a42',
          50: '#f0fbf5',
          100: '#e8f7ef',
          200: '#c5ebd7',
          300: '#8fd6b0',
          400: '#57bf87',
          500: '#26A55B',
          600: '#1d8a4b',
          700: '#1a7a42',
          800: '#175f35',
          900: '#134d2b',
        },
        // Semantic
        border: '#D4D4D4',
        footer: '#CACACA',
        background: '#ffffff',
        foreground: '#111111',
        // shadcn/ui compatibility
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
          foreground: '#111111',
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
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '8px',
        md: '6px',
        sm: '4px',
        xl: '12px',
        '2xl': '16px',
      },
      maxWidth: {
        content: '1200px',
      },
      height: {
        nav: '72px',
      },
      spacing: {
        nav: '72px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 12px 0 rgba(0, 0, 0, 0.10)',
        dropdown: '0 4px 16px 0 rgba(0, 0, 0, 0.12)',
      },
      transitionDuration: {
        DEFAULT: '150ms',
        slow: '300ms',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 1.5s infinite linear',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
