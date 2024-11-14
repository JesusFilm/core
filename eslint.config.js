const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')
const nxEslintPlugin = require('@nx/eslint-plugin')
const eslintPluginImport = require('eslint-plugin-import')
const love = require('eslint-config-love')
const nodePlugin = require('eslint-plugin-n')
const promisePlugin = require('eslint-plugin-promise')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended
})

module.exports = [
  {
    ...love,
    plugins: {
      '@nx': nxEslintPlugin,
      import: eslintPluginImport,
      n: nodePlugin,
      promise: promisePlugin
    }
  },
  { settings: { 'import/internal-regex': '^(@core|.prisma)' } },
  {
    rules: {
      'import/no-absolute-path': 'error',
      'import/default': 'error',
      'import/namespace': 'error',
      'import/no-restricted-paths': 'error',
      'import/no-dynamic-require': 'error',
      'import/no-webpack-loader-syntax': 'error',
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': 'error',
      'import/no-relative-packages': 'error',
      'import/export': 'error',
      'import/no-named-as-default': 'error',
      'import/no-named-as-default-member': 'error',
      'import/no-mutable-exports': 'error',
      'import/no-unused-modules': 'error',
      'import/no-amd': 'error',
      'import/first': 'error',
      'import/no-duplicates': 'error',
      'import/no-namespace': 'error',
      'import/order': [
        'error',
        {
          alphabetize: {
            order: 'asc',
            caseInsensitive: true
          },
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index'
          ],
          'newlines-between': 'always'
        }
      ],
      'import/newline-after-import': 'error',
      'import/no-named-default': 'error',
      'import/no-anonymous-default-export': 'error',
      'import/dynamic-import-chunkname': 'error',
      '@typescript-eslint/no-empty-function': [
        'error',
        { allow: ['decoratedFunctions'] }
      ],
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            'lodash',
            '@mui/material',
            '@mui/system',
            '@mui/icons-material',
            'react-i18next'
          ],
          patterns: ['@mui/*/*/*', '!@mui/material/test-utils/*', '*.mock']
        }
      ],
      'sort-imports': ['error', { ignoreDeclarationSort: true }]
    }
  },
  {
    files: [
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.spec.js',
      '**/*.spec.jsx',
      '**/*.stories.ts',
      '**/*.stories.tsx',
      '**/*.stories.js',
      '**/*.stories.jsx'
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            'lodash',
            '@mui/material',
            '@mui/system',
            '@mui/icons-material',
            'react-i18next'
          ],
          patterns: ['@mui/*/*/*', '!@mui/material/test-utils/*']
        }
      ]
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
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
  ...compat
    .config({ extends: ['plugin:@nx/typescript', 'prettier'] })
    .map((config) => ({
      ...config,
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        ...config.rules,
        '@typescript-eslint/consistent-type-imports': 'off',
        '@typescript-eslint/await-thenable': 'off',
        '@typescript-eslint/no-confusing-void-expression': 'off',
        '@typescript-eslint/consistent-type-exports': 'off',
        '@typescript-eslint/ban-tslint-comment': 'off',
        '@typescript-eslint/consistent-indexed-object-style': 'off',
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        '@typescript-eslint/prefer-optional-chain': 'off',
        '@typescript-eslint/non-nullable-type-assertion-style': 'off',
        '@typescript-eslint/no-extra-semi': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        'no-extra-semi': 'off'
      }
    })),
  ...compat
    .config({
      extends: ['plugin:@nx/javascript', 'standard', 'prettier']
    })
    .map((config) => ({
      ...config,
      files: ['**/*.js', '**/*.jsx'],
      rules: {
        ...config.rules,
        '@typescript-eslint/no-extra-semi': 'off',
        'no-extra-semi': 'off'
      }
    })),
  ...compat
    .config({ extends: ['plugin:i18next/recommended'] })
    .map((config) => ({
      ...config,
      files: ['**/*.tsx', '**/*.jsx'],
      rules: {
        ...config.rules,
        'react/react-in-jsx-scope': 'off',
        'react/jsx-indent': ['error', 2],
        'react/self-closing-comp': [
          'error',
          {
            component: true,
            html: true
          }
        ],
        'react/jsx-curly-brace-presence': [
          'error',
          {
            props: 'never',
            children: 'never'
          }
        ],
        'react/jsx-boolean-value': 'error'
      }
    })),
  ...compat
    .config({
      plugins: ['jest', 'jest-formatting'],
      extends: [
        'plugin:jest/recommended',
        'plugin:jest/style',
        'plugin:jest-formatting/recommended'
      ]
    })
    .map((config) => ({
      ...config,
      files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.spec.js', '**/*.spec.jsx'],
      rules: {
        ...config.rules,
        'jest/no-disabled-tests': 'off',
        'jest/require-top-level-describe': 'error',
        'i18next/no-literal-string': 'off',
        '@typescript-eslint/unbound-method': 'off'
      }
    })),
  ...compat
    .config({
      plugins: ['storybook'],
      extends: ['plugin:storybook/recommended']
    })
    .map((config) => ({
      ...config,
      files: [
        '**/*.stories.ts',
        '**/*.stories.tsx',
        '**/*.stories.js',
        '**/*.stories.jsx'
      ],
      rules: {
        ...config.rules,
        'i18next/no-literal-string': 'off'
      }
    })),
  { ignores: ['jest.config.ts', '.next', '.docusaurus'] }
]
