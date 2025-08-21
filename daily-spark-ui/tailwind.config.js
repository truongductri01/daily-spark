/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Daily Spark brand colors
        'spark-blue': {
          500: '#2d6cdf',
          600: '#1a4e8a',
        },
        'spark-orange': '#f7b84a',
        'spark-light-blue': '#eaf1fb',
        'spark-gray': {
          100: '#f9f9f9',
          200: '#e3e3e3',
          800: '#222',
        }
      },
      fontFamily: {
        'sans': ['Arial', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
