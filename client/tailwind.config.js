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
        bg: '#0a0e1a',
        surface: '#111827',
        border: '#1e293b',
        accent: '#00d9ff',
        accent2: '#7c3aed',
        accent3: '#f59e0b',
        success: '#10b981',
        danger: '#ef4444',
        warn: '#f59e0b',
        muted: '#64748b',
      },
      animation: {
        'pulse-fast': 'pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00d9ff33' },
          '100%': { boxShadow: '0 0 20px #00d9ff66, 0 0 40px #00d9ff22' },
        }
      }
    }
  },
  plugins: []
}
