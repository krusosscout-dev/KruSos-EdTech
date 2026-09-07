/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          750: '#253347',
          850: '#172033',
        },
        brand: {
          dark: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          gold: '#f59e0b',
          silver: '#94a3b8',
          bronze: '#d97706',
          primary: '#6366f1',
          success: '#10b981',
          accent: '#ec4899',
        }
      },
      animation: {
        'bounce-short': 'bounce 0.8s ease-in-out 2',
        'pulse-glow': 'pulseGlow 2s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)' },
          '50%': { boxShadow: '0 0 30px rgba(99, 102, 241, 0.9)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
