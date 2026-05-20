import commonConfig from '../../shared/eslint/common.mjs'

export default [
  ...commonConfig,
  {
    ignores: ['libs/shared/ai/vitest.config.mts']
  }
]
