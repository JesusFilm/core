import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#0f172a',
        accent: '#38bdf8',
        danger: '#f87171',
        success: '#34d399'
      },
      boxShadow: {
        floating: '0 20px 45px -20px rgba(14, 165, 233, 0.45)'
      }
    }
  },
  plugins: []
}

export default config
