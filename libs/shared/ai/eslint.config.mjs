import commonConfig from '../../shared/eslint/common.mjs'

export default [
  ...commonConfig,
  {
    ignores: [
      'libs/shared/ai/eslint.config.js',
      'libs/shared/ai/jest.config.ts',
      'libs/shared/ai/apollo.config.js'
    ]
  }
]
