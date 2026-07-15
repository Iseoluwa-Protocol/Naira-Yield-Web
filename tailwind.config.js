/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nigeria: {
          light: '#00A86B',
          DEFAULT: '#008751',
          dark: '#005A36',
        },
        gold: {
          light: '#F5C453',
          DEFAULT: '#D4AF37',
          dark: '#AA882C',
        },
        darkBg: '#090D10',
        cardBg: 'rgba(17, 24, 39, 0.7)',
        borderBg: 'rgba(255, 255, 255, 0.08)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
