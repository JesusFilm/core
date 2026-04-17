import nextConfig from '../../shared/eslint/next.mjs'

export default [
  ...nextConfig,
  {
    ignores: [
      'libs/shared/ui/jest.config.ts',
      'libs/shared/ui/**/*.stories.{ts,tsx,js,jsx}',
      'libs/shared/ui/src/libs/storybook/**',
      'libs/shared/ui/src/libs/sharedUiConfig/**',
      'libs/shared/ui/src/libs/simpleComponentConfig/**',
      'libs/shared/ui/src/components/ThemeDecorator/**'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-void': ['error', { allowAsStatement: true }],
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/require-await': 'off'
    }
  }
]
