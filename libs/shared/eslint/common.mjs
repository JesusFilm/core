import nxEslintPlugin from '@nx/eslint-plugin'
import eslintPluginImport from 'eslint-plugin-import'
import loveConfig from 'eslint-config-love'
import nodePlugin from 'eslint-plugin-n'
import promisePlugin from 'eslint-plugin-promise'
import tsParser from '@typescript-eslint/parser'
import prettierConfig from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'
import eslint from '@eslint/js'
import i18next from 'eslint-plugin-i18next'
import pluginJest from 'eslint-plugin-jest'
import jestFormatting from 'eslint-plugin-jest-formatting'
import storybook from 'eslint-plugin-storybook'

const commonConfig = [
  {
    ignores: [
      'jest.config.ts',
      '.next',
      '.docusaurus',
      '!.storybook',
      '**/eslint.config.mjs'
    ]
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  i18next.configs['flat/recommended'],
  ...storybook.configs['flat/recommended'],
  {
    ...loveConfig,
    ...prettierConfig,
    plugins: {
      '@nx': nxEslintPlugin,
      import: eslintPluginImport,
      n: nodePlugin,
      promise: promisePlugin
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.*'],
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'off'
    }
  },
  { settings: { 'import/internal-regex': '^(@core|.prisma)' } },
  {
    rules: {
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/ban-tslint-comment': 'off',
      '@typescript-eslint/class-methods-use-this': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/consistent-type-exports': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/init-declarations': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-duplicate-type-constituents': 'off',
      '@typescript-eslint/no-empty-function': [
        'error',
        { allow: ['decoratedFunctions'] }
      ],
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-object': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-extra-semi': 'off',
      '@typescript-eslint/no-import-type-side-effects': 'off',
      '@typescript-eslint/no-loop-func': 'warn',
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/max-params': 'off',
      '@typescript-eslint/no-meaningless-void-operator': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unnecessary-template-expression': 'off',
      '@typescript-eslint/no-unnecessary-type-arguments': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/non-nullable-type-assertion-style': 'off',
      '@typescript-eslint/only-throw-error': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/require-await': 'off',
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
          alphabetize: { order: 'asc', caseInsensitive: true },
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
      'no-extra-semi': 'off',
      'no-empty': 'warn',
      'no-magic-numbers': 'off',
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
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      globals: {
        require: 'readonly',
        module: 'readonly',
        process: 'readonly'
      }
    },
    rules: {
      '@typescript-eslint/no-array-delete': 'off'
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
  {
    files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.spec.js', '**/*.spec.jsx'],
    plugins: { jest: pluginJest, 'jest-formatting': jestFormatting },
    languageOptions: { globals: pluginJest.environments.globals.globals },
    rules: {
      ...jestFormatting.configs.recommended.overrides[0].rules,
      'jest/no-disabled-tests': 'off',
      'jest/require-top-level-describe': 'error',
      'i18next/no-literal-string': 'off',
      '@typescript-eslint/unbound-method': 'off'
    }
  },
  {
    files: [
      '**/*.stories.ts',
      '**/*.stories.tsx',
      '**/*.stories.js',
      '**/*.stories.jsx'
    ],
    rules: { 'i18next/no-literal-string': 'off' }
  },
  {
    files: ['**/jest.config.ts'],
    rules: {
      'import/no-anonymous-default-export': 'off'
    }
  },
  {
    ignores: ['./webpack.config.js', './eslint.config.(mj|j)s']
  }
]

export default commonConfig
