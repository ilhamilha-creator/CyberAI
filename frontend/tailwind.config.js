/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cyber: { 
          ink: '#04080f', 
          surface: '#080f1e', 
          card: '#0c1628', 
          hover: '#101d35', 
          input: '#0a1225', 
          sidebar: '#060d1a' 
        },
        accent: { 
          primary: '#64ffda', 
          secondary: '#00b4d8', 
          tertiary: '#7c3aed' 
        },
        severity: { 
          critical: '#ff2d55', 
          high: '#ff6b35', 
          medium: '#ffa62b', 
          low: '#00b4d8', 
          info: '#8892b0' 
        },
        neon: { 
          cyan: '#64ffda', 
          blue: '#00b4d8', 
          purple: '#7c3aed', 
          pink: '#ff2d55', 
          orange: '#ff6b35',
          gold: '#ffd700',
          silver: '#c0c0c0'
        },
      },
      fontFamily: { 
        display: ['Bebas Neue', 'sans-serif'], 
        mono: ['IBM Plex Mono', 'monospace'], 
        body: ['DM Sans', 'sans-serif'] 
      },
      boxShadow: { 
        glow: '0 0 20px rgba(100,255,218,0.15)', 
        'glow-lg': '0 0 40px rgba(100,255,218,0.2)', 
        'glow-xl': '0 0 60px rgba(100,255,218,0.3)',
        neon: '0 0 10px rgba(100,255,218,0.5), 0 0 40px rgba(100,255,218,0.2)',
        'neon-purple': '0 0 10px rgba(124,58,237,0.5), 0 0 40px rgba(124,58,237,0.2)',
        'neon-red': '0 0 10px rgba(255,45,85,0.5), 0 0 40px rgba(255,45,85,0.2)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
      },
      animation: { 
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite', 
        'slide-up': 'slide-up 0.4s ease-out', 
        'scanline': 'scanline 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient-x': 'gradient-x 3s ease infinite',
        'gradient-y': 'gradient-y 3s ease infinite',
        'gradient-xy': 'gradient-xy 3s ease infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 3s infinite'
      },
      keyframes: { 
        'pulse-glow': { 
          '0%, 100%': { opacity: 1 }, 
          '50%': { opacity: 0.4 } 
        }, 
        'slide-up': { 
          from: { opacity: 0, transform: 'translateY(10px)' }, 
          to: { opacity: 1, transform: 'translateY(0)' } 
        }, 
        scanline: { 
          from: { transform: 'translateY(-100%)' }, 
          to: { transform: 'translateY(100%)' } 
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        shimmer: {
          from: { backgroundPosition: '0 0' },
          to: { backgroundPosition: '-200% 0' }
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'gradient-y': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center bottom'
          }
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
