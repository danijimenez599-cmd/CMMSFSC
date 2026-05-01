/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: 'var(--color-brand)',
          dark: 'var(--color-brand-dark)',
          light: 'var(--color-brand-light)',
        },
        accent: 'var(--color-accent)',
        ocre: 'var(--color-ocre)',
        work: {
          preventive: 'var(--color-work-preventive)',
          'preventive-bg': 'var(--color-work-preventive-bg)',
          'preventive-border': 'var(--color-work-preventive-border)',
          corrective: 'var(--color-work-corrective)',
          'corrective-bg': 'var(--color-work-corrective-bg)',
          'corrective-border': 'var(--color-work-corrective-border)',
          projection: 'var(--color-work-projection)',
          'projection-bg': 'var(--color-work-projection-bg)',
          'projection-border': 'var(--color-work-projection-border)',
          completed: 'var(--color-work-completed)',
          'completed-bg': 'var(--color-work-completed-bg)',
          'completed-border': 'var(--color-work-completed-border)',
          overdue: 'var(--color-work-overdue)',
          'overdue-bg': 'var(--color-work-overdue-bg)',
          'overdue-border': 'var(--color-work-overdue-border)',
        },
        status: {
          open: 'var(--color-status-open)',
          'open-bg': 'var(--color-status-open-bg)',
          'open-border': 'var(--color-status-open-border)',
          assigned: 'var(--color-status-assigned)',
          'assigned-bg': 'var(--color-status-assigned-bg)',
          'assigned-border': 'var(--color-status-assigned-border)',
          progress: 'var(--color-status-progress)',
          'progress-bg': 'var(--color-status-progress-bg)',
          'progress-border': 'var(--color-status-progress-border)',
          hold: 'var(--color-status-hold)',
          'hold-bg': 'var(--color-status-hold-bg)',
          'hold-border': 'var(--color-status-hold-border)',
          completed: 'var(--color-status-completed)',
          'completed-bg': 'var(--color-status-completed-bg)',
          'completed-border': 'var(--color-status-completed-border)',
          cancelled: 'var(--color-status-cancelled)',
          'cancelled-bg': 'var(--color-status-cancelled-bg)',
          'cancelled-border': 'var(--color-status-cancelled-border)',
        },
        bg: {
          app: 'var(--color-bg-app)',
          2: 'var(--color-bg-2)',
          3: 'var(--color-bg-3)',
          4: 'var(--color-bg-4)',
        },
        tx: {
          DEFAULT: 'var(--color-tx)',
          2: 'var(--color-tx-2)',
          3: 'var(--color-tx-3)',
          4: 'var(--color-tx-4)',
        },
        ok: {
          DEFAULT: 'var(--color-ok)',
          bg: 'var(--color-ok-bg)',
        },
        warn: {
          DEFAULT: 'var(--color-warn)',
          bg: 'var(--color-warn-bg)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          bg: 'var(--color-danger-bg)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          bg: 'var(--color-info-bg)',
        },
        border: 'var(--color-border)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        floating: 'var(--shadow-floating)',
      },
      keyframes: {
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.2s ease-out',
        'fade-in': 'fade-in 0.15s ease-out',
      },
    },
  },
  plugins: [],
};
