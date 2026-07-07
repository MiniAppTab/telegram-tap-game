/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: '#FFD700',
        dark: '#1A1A2E',
        darker: '#16213E',
        light: '#E2E2E2',
        accent: '#0F3460',
      },
    },
  },
  plugins: [],
};
