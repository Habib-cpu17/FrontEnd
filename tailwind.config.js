/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      colors: {
        // Light — warm beige / sage
        cream: {
          50: "#faf8f2",
          100: "#f5f2ea",
          200: "#ebe6d6",
          300: "#ddd6bf",
        },
        sage: {
          300: "#c0cbb2",
          400: "#a8b39a",
          500: "#8b9a7d",
          600: "#6f7e62",
          700: "#556148",
        },
        olive: {
          800: "#2d3428",
          900: "#1c211a",
          950: "#12140f",
        },
      },
    },
  },
  plugins: [],
};