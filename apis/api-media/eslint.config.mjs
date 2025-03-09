import baseConfig from '../../eslint.config.mjs'

export default [
  ...baseConfig,
  {
    ignores: [
      'apis/api-media/eslint.config.js',
      'apis/api-media/webpack.config.js'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['apis/api-media/tsconfig.*?.json'] }
    }
  }
]
