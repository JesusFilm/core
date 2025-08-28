import commonConfig from '../../libs/shared/eslint/common.mjs'

export default [
  ...commonConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-void': ['error', { allowAsStatement: true }],
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/require-await': 'off'
    }
  }
]
