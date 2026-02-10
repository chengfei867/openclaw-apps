/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 20px 45px -25px rgba(59, 130, 246, 0.45)',
      },
    },
  },
  plugins: [],
};
