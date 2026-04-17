import nextConfig from '../../libs/shared/eslint/next.mjs'

export default [
  ...nextConfig,
  {
    ignores: [
      'apps/journeys-admin/jest.config.ts',
      'apps/journeys-admin/postcss.config.mjs',
      'apps/journeys-admin/next.config.js',
      'apps/journeys-admin/i18next-parser.config.js',
      'apps/journeys-admin/**/*.stories.{ts,tsx,js,jsx}',
      'apps/journeys-admin/src/libs/storybook/**'
    ]
  },
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
  }
]
