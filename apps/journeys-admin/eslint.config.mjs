import nextConfig from '../../libs/shared/eslint/next.mjs'

export default [
  ...nextConfig,
  {
    ignores: [
      'apps/journeys-admin/eslint.config.js',
      'apps/journeys-admin/jest.config.ts',
      'apps/journeys-admin/postcss.config.mjs',
      'apps/journeys-admin/.next/*'
    ]
  },
  { languageOptions: { globals: {} } },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@next/next/no-html-link-for-pages': [
        'error',
        'apps/journeys-admin/pages/'
      ],
      'no-void': ['error', { allowAsStatement: true }],
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/require-await': 'off'
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-void': ['error', { allowAsStatement: true }],
      '@typescript-eslint/no-misused-promises': 'off'
    },
    languageOptions: {
      parserOptions: { project: ['apps/journeys-admin/tsconfig.*?.json'] }
    }
  },
  // Relax module boundary rule for journeys-admin to allow static imports
  // of journeys-ui even when some parts are lazy-loaded via Next dynamic
  {
    files: ['apps/journeys-admin/**/*.{ts,tsx,js,jsx}'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [
            '@core/journeys/ui',
            '@core/journeys/ui/*',
            '@core/journeys/ui/**'
          ],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*']
            }
          ]
        }
      ]
    }
  },
  {
    files: ['apps/journeys-admin/next-env.d.ts'],
    rules: { '@typescript-eslint/triple-slash-reference': 'off' }
  }
]
