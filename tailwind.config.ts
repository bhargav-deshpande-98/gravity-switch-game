import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        game: {
          bg: '#1a1a2e',
          bgAlt: '#16213e',
          player: '#00ff88',
          spike: '#ff4757',
          block: '#4cc9f0',
        }
      },
    },
  },
  plugins: [],
} satisfies Config
