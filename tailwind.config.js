/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f7f6f2',
        surface: {
          DEFAULT: '#ffffff',
          muted: '#eeece6',
        },
        ink: {
          DEFAULT: '#2f3437',
          muted: '#6a7074',
        },
        line: {
          DEFAULT: '#e2dfd7',
          strong: '#b8b4a8',
        },
        accent: {
          DEFAULT: '#4d6e7e',
          deep: '#3b5967',
          soft: '#e2ebef',
        },
        clay: {
          DEFAULT: '#b5583f',
          deep: '#9a4632',
          soft: '#f6e4de',
        },
        ochre: {
          DEFAULT: '#e0b04e',
          ink: '#7a5610',
          soft: '#f7edd3',
        },
        sage: {
          DEFAULT: '#9bb394',
          deep: '#4f6a4a',
          soft: '#e4ebe0',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', '"Hiragino Sans"', '"Yu Gothic"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 420ms ease-out both',
      },
    },
  },
  plugins: [],
};
