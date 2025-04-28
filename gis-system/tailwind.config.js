// more info about tailwind customization here https://tailwindcss.com/docs/configuration

// @ts-ignore
// eslint-disable-next-line no-undef
module.exports = {
  content: ['./src/index.html', './src/**/*.{js,ts,jsx,tsx}'],
  plugins: [],
  theme: {
    extend: {
      colors: {
        primary: '#454544',
      },
    },
  },
}
