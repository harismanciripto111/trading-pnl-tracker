/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0a0e1a',
          800: '#111827',
          700: '#1a1f36',
          600: '#242b45',
        },
        gold: {
          DEFAULT: '#f0b90b',
          light: '#f5d245',
          dark: '#c99a09',
          glow: 'rgba(240, 185, 11, 0.2)',
        },
        profit: {
          DEFAULT: '#00c48c',
          light: '#33d4a4',
          dark: '#00a375',
          glow: 'rgba(0, 196, 140, 0.2)',
        },
        loss: {
          DEFAULT: '#ff4d6a',
          light: '#ff7a91',
          dark: '#e03355',
          glow: 'rgba(255, 77, 106, 0.2)',
        },
        emerald: {
          DEFAULT: '#00c48c',
          light: '#33d4a4',
          dark: '#00a375',
          glow: 'rgba(0, 196, 140, 0.2)',
        },
        ruby: {
          DEFAULT: '#ff4d6a',
          light: '#ff7a91',
          dark: '#e03355',
          glow: 'rgba(255, 77, 106, 0.2)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'gradient-shift': 'gradient-shift 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'glow-pulse': {
          '0%': { boxShadow: '0 0 5px rgba(240, 185, 11, 0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(240, 185, 11, 0.3)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
