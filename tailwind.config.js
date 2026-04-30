/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        btl: {
          green:         '#1a5c2a',
          'green-dark':  '#0f3a1a',
          'green-deep':  '#0a1f0e',
          'green-mid':   '#236b32',
          'green-light': '#2a8040',
          'green-bright':'#4ade80',
          'green-pale':  '#a8c4aa',
          'green-dim':   '#5a8060',
          red:           '#c8102e',
          'red-dark':    '#9e0c23',
        },
        // Plus de navy — on remplace par du vert noirâtre
        surface: {
          900: '#070d09',   // fond le plus sombre
          850: '#0a1f0e',   // fond principal
          800: '#0d2913',   // cartes sombres
          700: '#0f3a1a',   // cartes moyennes
          600: '#1a5c2a',   // éléments actifs
          500: '#236b32',   // hover
        },
        fx: {
          buy:  '#4ade80',
          sell: '#fb7185',
          gold: '#fbbf24',
        },
      },
      fontFamily: {
        sans:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
        display: ['Montserrat', 'sans-serif'],
      },
      animation: {
        'fade-up':   'fadeUp 0.3s ease both',
        'pulse-dot': 'pulseDot 1.5s infinite',
        'ticker':    'ticker 45s linear infinite',
        'slide-in':  'slideIn 0.3s ease',
      },
      keyframes: {
        fadeUp:   { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseDot: { '0%,100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: 0.4, transform: 'scale(0.6)' } },
        ticker:   { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        slideIn:  { from: { transform: 'translateX(-20px)', opacity: 0 }, to: { transform: 'translateX(0)', opacity: 1 } },
      },
    },
  },
  plugins: [],
}