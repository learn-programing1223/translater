/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#28C6B1',
        secondary: '#F1F3F5',
        'text-dark': '#212529',
        'text-light': '#F8F9FA',
        error: '#DC2626',
        success: '#10B981',
      },
    },
  },
  plugins: [],
}