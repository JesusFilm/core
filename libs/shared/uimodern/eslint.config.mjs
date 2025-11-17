import nx from '@nx/eslint-plugin'
import commonConfig from '../eslint/common.mjs'

export default [
  ...commonConfig,
  ...nx.configs['flat/react'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {}
  }
]
