/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",       // for App Router (Next.js 13+)
    "./pages/**/*.{js,ts,jsx,tsx}",     // for Pages Router
    "./components/**/*.{js,ts,jsx,tsx}",// common component folder
    "./src/**/*.{js,ts,jsx,tsx}",       // if you’re nesting everything inside src/
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
