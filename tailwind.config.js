/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      gridTemplateColumns: {
        21: 'repeat(21, minmax(0, 1fr))',
      },
      gridTemplateRows: {
        21: 'repeat(21, minmax(0, 1fr))',
      },
      fontFamily: {
        arcade: ['"Press Start 2P"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        'maze-blue': '#1E40AF',
        'pacman-yellow': '#F7D51D',
        'ghost-red': '#EF4444',
        'ghost-pink': '#EC4899',
        'ghost-blue': '#3B82F6',
        'ghost-orange': '#F97316',
      },
      boxShadow: {
        neonBlue: '0 0 10px rgba(37, 99, 235, 0.9), 0 0 20px rgba(37, 99, 235, 0.5)',
        neonYellow: '0 0 10px rgba(247, 213, 29, 0.9), 0 0 20px rgba(247, 213, 29, 0.5)',
        neonRed: '0 0 10px rgba(239, 68, 68, 0.9), 0 0 20px rgba(239, 68, 68, 0.5)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.37)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        flicker: {
          '0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': {
            opacity: '1',
            filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.3))',
          },
          '20%, 21.999%, 63%, 63.999%, 65%, 69.999%': {
            opacity: '0.4',
          },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.7', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        flicker: 'flicker 2s linear infinite',
        glowPulse: 'glowPulse 1.6s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'ping-fast': 'ping 0.8s cubic-bezier(0,0,0.2,1) infinite',
      },
    },
  },
  plugins: [],
};
