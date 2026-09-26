/** @type {import('tailwindcss').Config} */

/**
 * "Dark & Gold Luxury" palette
 * ----------------------------
 * slate   -> warm charcoal (dark surfaces) / warm ivory (light surfaces)
 * indigo  -> gold / brass (primary interactive colour: buttons, links, rings)
 * brand   -> gold
 * gave    -> deep wine (customers owe you)
 * got     -> emerald (you owe / settled)
 * All other components keep their utility classes and pick this up globally.
 */

const slate = {
  50: '#faf9f5',
  100: '#f3f0e9',
  200: '#e7e1d4',
  300: '#d5ccba',
  400: '#a89f8c',
  500: '#7e7565',
  600: '#5f5749',
  700: '#474135',
  800: '#2f2a22',
  900: '#1f1b15',
  950: '#131109'
};

const gold = {
  50: '#fdf9ec',
  100: '#f9efd2',
  200: '#f2dfa4',
  300: '#e9c76b',
  400: '#dfae3a',
  500: '#c9970c',
  600: '#a67c08',
  700: '#87640c',
  800: '#6d500f',
  900: '#5a420f',
  950: '#332206'
};

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate,
        indigo: gold,
        brand: {
          50: gold[50],
          100: gold[100],
          500: gold[500],
          600: gold[600],
          700: gold[700],
        },
        gave: {
          50: '#fdf3f3',
          100: '#fbe5e5',
          500: '#b33030',
          600: '#972626',
          700: '#7c1f1f',
        },
        got: {
          50: '#effaf4',
          100: '#d8f3e3',
          500: '#159a62',
          600: '#107c4f',
          700: '#0d6440',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
