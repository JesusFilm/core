import baseConfig from '../../../eslint.config.mjs'

export default [
  ...baseConfig,
  {
    ignores: [
      'libs/shared/ai/eslint.config.js',
      'libs/shared/ai/jest.config.ts',
      'libs/shared/ai/apollo.config.js'
    ]
  }
]
