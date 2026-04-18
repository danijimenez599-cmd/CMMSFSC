/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6366f1', // Indigo 500
          hover:   '#4f46e5', // Indigo 600
          light:   '#818cf8', // Indigo 400
          pale:    'rgba(99, 102, 241, 0.1)',
          pale2:   'rgba(99, 102, 241, 0.2)',
        },
        ocre: '#f59e0b',
        surface: 'var(--surface)',
        bg: {
          DEFAULT: 'var(--bg-default)',
          2: 'var(--bg-2)',
          3: 'var(--bg-3)',
        },
        tx: {
          DEFAULT: 'var(--tx-default)',
          2: 'var(--tx-2)',
          3: 'var(--tx-3)',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      borderRadius: { cmms: '14px' },
      boxShadow: {
        card:  '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)',
        cardHov: '0 10px 40px rgba(0,0,0,0.1)',
        card2: '0 4px 24px rgba(0,0,0,0.11)',
      },
    },
  },
  plugins: [],
}

