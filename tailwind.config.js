/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#0a0d14',
          1: '#0f1320',
          2: '#151b2e',
          3: '#1e2640',
          4: '#252f4a',
        },
        border: {
          DEFAULT: '#2a3350',
          light: '#3d4f70',
        },
        critical: '#ef4444',
        high: '#f97316',
        medium: '#f59e0b',
        low: '#3b82f6',
        safe: '#10b981',
        crown: '#fbbf24',
        'shadow-it': '#a855f7',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
