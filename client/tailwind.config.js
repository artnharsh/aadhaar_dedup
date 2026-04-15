/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Syne', 'sans-serif'],
        body: ['IBM Plex Sans', 'sans-serif'],
      },
      colors: {
        bg: '#08111c',
        surface: '#0f1b2d',
        border: '#22324a',
        accent: '#63d2e7',
        accent2: '#8aa8ff',
        accent3: '#f3b46b',
        success: '#38c793',
        danger: '#ff7d7d',
        warn: '#f3b46b',
        muted: '#8da1ba',
      },
      animation: {
        'pulse-fast': 'pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 6px rgba(99, 210, 231, 0.16)' },
          '100%': { boxShadow: '0 0 20px rgba(99, 210, 231, 0.28), 0 0 40px rgba(99, 210, 231, 0.12)' },
        }
      }
    }
  },
  plugins: []
}
