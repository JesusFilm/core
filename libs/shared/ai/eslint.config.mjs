import commonConfig from '../../shared/eslint/common.mjs'

export default [
  ...commonConfig,
  {
    ignores: ['libs/shared/ai/jest.config.ts']
  }
]
