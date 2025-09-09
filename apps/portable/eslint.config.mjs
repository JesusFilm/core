import reactNativeConfig from '../../libs/shared/eslint/react-native.mjs'

export default [
  ...reactNativeConfig,
  {
    ignores: [
      'apps/portable/metro.config.js',
      'apps/portable/babel.config.js',
      'apps/portable/tailwind.config.js',
      'apps/portable/postcss.config.js',
      'apps/portable/eas.json',
      'apps/portable/app.json',
      'apps/portable/index.js',
      'apps/portable/node_modules/**'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-void': ['error', { allowAsStatement: true }],
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-floating-promises': 'off', // Allow floating promises in React Native
      '@typescript-eslint/no-unused-vars': 'warn', // Make unused vars warnings instead of errors
      'react-native/no-inline-styles': 'off', // Allow inline styles for React Native
      'react-native/no-color-literals': 'off', // Allow color literals for React Native
      'i18next/no-literal-string': 'off', // Disable literal string checking for React Native
      'react/no-unescaped-entities': 'off', // Allow unescaped entities in React Native
      'import/namespace': 'off' // Disable namespace checking for React Native modules
    }
  }
]
