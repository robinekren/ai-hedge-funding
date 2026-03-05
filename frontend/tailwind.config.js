/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#0a0a0a',
          surface: '#111111',
          border: '#1a1a1a',
          green: '#00ff88',
          'green-dim': '#00cc6a',
          'green-glow': 'rgba(0, 255, 136, 0.1)',
          red: '#ff3355',
          'red-dim': '#cc2244',
          amber: '#ffaa00',
          text: '#e0e0e0',
          'text-dim': '#888888',
          'text-muted': '#555555',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'green-glow': '0 0 20px rgba(0, 255, 136, 0.15)',
        'red-glow': '0 0 20px rgba(255, 51, 85, 0.15)',
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
