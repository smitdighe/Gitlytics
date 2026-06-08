/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0a0a0a',
          50: '#1a1a1a',
          100: '#0f0f0f',
          200: '#141414',
          300: '#1f1f1f',
          400: '#2a2a2a',
        },
        accent: '#e8ff5a',
        'accent-dim': 'rgba(232, 255, 90, 0.1)',
        muted: '#666666',
        error: '#ff6b6b',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        body: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        sm: '6px',
      },
    },
  },
  plugins: [],
};
