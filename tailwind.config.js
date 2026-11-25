/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ktc-green': {
          DEFAULT: '#0E4B2E',
          hover: '#0A3A23',
          dark: '#082a19',
          light: '#ECFDF5',
        },
        'ktc-gold': {
          DEFAULT: '#FACC15',
          hover: '#eab308',
          active: '#ca8a04',
        },
        'ktc-canvas': '#F6F8F7',
      },
    },
  },
  plugins: [],
};
