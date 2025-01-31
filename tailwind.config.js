/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'custom-deep': '#4deeea 0px 19px 38px, #4deeea 0px 15px 12px',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.hide-scrollbar': {
          '::-webkit-scrollbar': { display: 'none' },
          'scrollbar-width': 'none',
        },
      });
    },
  ],
}

