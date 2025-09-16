import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../libs/**/*.{js,ts,jsx,tsx,mdx}'
  ]
}

export default config
