import baseConfig from '../../eslint.config.mjs'

export default [
  ...baseConfig,
  {
    ignores: [
      'apis/media-transcoder/eslint.config.js',
      'apis/media-transcoder/webpack.config.js'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['apis/media-transcoder/tsconfig.*?.json'] }
    }
  }
]
