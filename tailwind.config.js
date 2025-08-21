/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'explora-blue': '#083D77',
        'explora-blue-dark': '#062f5a',
      }
    },
  },
  plugins: [],
}
