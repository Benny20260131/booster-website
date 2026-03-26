/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'booster-red': '#e31d1a', // Thermo Fisher's red
      }
    },
  },
  plugins: [],
}
