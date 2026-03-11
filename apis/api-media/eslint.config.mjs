import apiConfig from '../../libs/shared/eslint/api.mjs'

export default [
  ...apiConfig,
  {
    files: ['**/scripts/**', '**/seeds/**'],
    rules: {
      '@nx/enforce-module-boundaries': 'off'
    }
  }
]
