/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta APEX CMMS
        brand: {
          DEFAULT: '#8b1a00',
          hover:   '#a82000',
          light:   '#b52400',
          pale:    'rgba(139,26,0,0.07)',
          pale2:   'rgba(139,26,0,0.13)',
        },
        ocre: '#c8693a',
        surface: '#ffffff',
        bg: {
          DEFAULT: '#f7f3f0',
          2: '#f0e9e2',
          3: '#e6ddd5',
        },
        tx: {
          DEFAULT: '#1a0f0a',
          2: '#4a2e24',
          3: '#8a6456',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      borderRadius: { cmms: '14px' },
      boxShadow: {
        card:  '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)',
        card2: '0 4px 24px rgba(0,0,0,0.11)',
      },
    },
  },
  plugins: [],
}
