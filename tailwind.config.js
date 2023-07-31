/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.tsx'],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      keyframes: {
        ripple: {
          '0%': {
            top: '0.5rem',
            left: '0.5rem',
            width: 0,
            height: 0,
            opacity: 0,
          },
          '4.9%': {
            top: '0.5rem',
            left: '0.5rem',
            width: 0,
            height: 0,
            opacity: 0,
          },
          '5%': {
            top: '0.5rem',
            left: '0.5rem',
            width: 0,
            height: 0,
            opacity: 1,
          },
          '100%': {
            top: 0,
            left: 0,
            width: '1rem',
            height: '1rem',
            opacity: 0,
          },
        },
      },
    },
  },
  plugins: [],
}
