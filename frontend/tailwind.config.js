/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
    fontFamily: {
      'poppins': ["Poppins", 'sans-serif'],
      'montserrat': ["Montserrat", "sans-serif"],
      'worksans': ["Work Sans", "sans-serif"],
      'philosopher': ["Philosopher", "sans-serif"]
    },
  },
    
  },
  plugins: [
    
  ],
}