import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // JobBoard brand scale — single source of truth for the indigo
        // accent used across buttons, links, focus rings, and badges.
        primary: {
          50:'#eef2ff',100:'#e0e7ff',200:'#c7d2fe',300:'#a5b4fc',
          400:'#818cf8',500:'#6366f1',600:'#4f46e5',700:'#4338ca',
          800:'#3730a3',900:'#312e81',
        },
      },
      minHeight: { touch: '44px' },
      minWidth:  { touch: '44px' },
    },
  },
  plugins: [],
}
export default config
