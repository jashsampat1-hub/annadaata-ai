/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0b0f12', // Deep matte black background
          charcoal: '#11171d', // Charcoal card containers
          surface: '#111827',
          border: '#1e293b', // Subtle dark slate/cyan outlines
          accent: '#10b981', // Tactical emerald
          accentGlow: '#059669',
          amber: '#f59e0b',
          rose: '#f43f5e',
          cyan: '#06b6d4',
          neon: '#22c55e',
          purple: '#a855f7', // High-voltage neon purple
          purpleGlow: '#9333ea',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.45)',
        'glow-purple': '0 0 25px -5px rgba(168, 85, 247, 0.45)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.45)',
        'glow-rose': '0 0 25px -5px rgba(244, 63, 94, 0.55)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.45)',
        'cyber-card': '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'tactical': '0 0 20px 2px rgba(16, 185, 129, 0.5)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flash-critical': 'flashCritical 1.2s infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        flashCritical: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.02)' }
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' }
        }
      }
    },
  },
  plugins: [],
}
