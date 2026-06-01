import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#B5451B',
        'brand-light': '#FFF0EB',
        gold: '#C9973A',
        surface: '#FDF6EE',
      },
    },
  },
  plugins: [],
}

export default config
