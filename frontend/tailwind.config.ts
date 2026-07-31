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
        // Official JobBoard brand colors, sampled from the mascot logo.
        // Use these (not raw hex/indigo) for anything logo-adjacent —
        // header, footer, auth screens — per the Phase 1 brand system.
        navy: {
          50:'#eef3fa',100:'#d6e3f3',200:'#aec7e8',300:'#7fa5d8',
          400:'#4c7ec0',500:'#2a5a9e',600:'#173f7c',700:'#0f2e5e',
          800:'#0a2247',900:'#071831',
        },
        brandOrange: {
          50:'#fff4eb',100:'#ffe3cc',200:'#ffc599',300:'#ffa35c',
          400:'#ff8b2e',500:'#fb7a0e',600:'#e56600',700:'#b85200',
          800:'#8f4000',900:'#663000',
        },
      },
      minHeight: { touch: '44px' },
      minWidth:  { touch: '44px' },
    },
  },
  plugins: [],
}
export default config
