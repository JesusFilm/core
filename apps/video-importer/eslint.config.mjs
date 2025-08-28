import commonConfig from '../../libs/shared/eslint/common.mjs'

export default [
  ...commonConfig,
  { ignores: ['apps/video-importer/eslint.config.js'] },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['apps/video-importer/tsconfig.json'] }
    }
  }
]
