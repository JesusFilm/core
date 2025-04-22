import baseConfig from '../../eslint.config.mjs'

export default [
  ...baseConfig,
  { ignores: ['apis/api-gateway/eslint.config.js'] },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['apis/api-gateway/tsconfig.*?.json'] }
    }
  }
]
