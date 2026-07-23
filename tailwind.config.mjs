/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./feautures/**/*.{ts,tsx}",
  ],
  darkMode: ["selector", ".dark", '[data-theme="dark"]'],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default tailwindConfig;
