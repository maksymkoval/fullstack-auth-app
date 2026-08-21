/** @type {import('tailwindcss').Config} */
export default {
  // content: де Tailwind шукає використані класи, щоб згенерувати лише потрібний CSS.
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
