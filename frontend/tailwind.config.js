/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        mithila: {
          cream: '#FAF6F0',
          warm: '#FDFBF7',
          sand: '#F3ECE2',
          border: '#E8DEC9',
          brown: {
            DEFAULT: '#4A2E1B',
            dark: '#27170E',
            light: '#6D4A32',
            muted: '#8A6D56'
          },
          gold: {
            DEFAULT: '#D99B26',
            light: '#F5C667',
            dark: '#B07812',
            pale: '#FEF8EA'
          },
          green: {
            DEFAULT: '#2D5A27',
            dark: '#1C3B18',
            light: '#EAF3E7',
            border: '#B6D7AF'
          }
        }
      },
      boxShadow: {
        'soft': '0 8px 30px -4px rgba(74, 46, 27, 0.07)',
        'card': '0 12px 35px -6px rgba(74, 46, 27, 0.1)',
        'lift': '0 20px 45px -10px rgba(74, 46, 27, 0.15)',
        'gold': '0 10px 25px -5px rgba(217, 155, 38, 0.3)'
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #FAF6F0 0%, #F5ECE0 50%, #EFE1CE 100%)',
        'gold-shimmer': 'linear-gradient(90deg, #D99B26 0%, #F5C667 50%, #D99B26 100%)',
      }
    },
  },
  plugins: [],
}
