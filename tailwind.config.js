/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F6F6F6',
        w: '#fff',
        pr: '#D64045',
        'pr-hov': '#B7353A',
        pl: '#FFEDEA',
        tx: '#1F1F1F',
        su: '#707070',
        bd: '#E3E5EA',
        re: '#B12A1B',
        're-bg': '#FFEDEA',
        am: '#8A6408',
        'am-bg': '#FFF3DF',
        gr: '#1F6F4E',
        'gr-bg': '#E8F6EF',
        info: '#1A5FA5',
        'info-bg': '#EAF3FF',
        accent: '#EEF7F8',
        dis: '#B0B0B0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      maxWidth: {
        app: '430px',
      },
      borderRadius: {
        xl2: '16px',
        xl3: '20px',
      },
    },
  },
  plugins: [],
}
