import commonConfig from './common.mjs'

const apiConfig = [
  ...commonConfig,
  {
    ignores: ['**/webpack.config.js']
  },
  {
    files: ['**/scripts/**', '**/seeds/**'],
    rules: {
      '@nx/enforce-module-boundaries': 'off'
    }
  }
]

export default apiConfig
