import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'press-start': ['"Press Start 2P"', 'cursive'],
      },
      colors: {
        'arcade-blue': '#00ffff',
        'arcade-purple': '#ff00ff',
        'arcade-bg': '#0a0a0a',
      },
      boxShadow: {
        'arcade-glow': '0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 20px #ff00ff, 0 0 30px #ff00ff',
      }
    },
  },
  plugins: [],
}
export default config
