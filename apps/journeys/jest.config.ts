import type { Config } from 'jest'

const esmModules = ['swiper', 'ssr-window', 'dom7']

const config: Config = {
  displayName: 'journeys',
  transform: {
    // '(?!.*\\.mjs$|swiper|ssr-window|dom7)': 'babel-jest',
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': [
      'babel-jest',
      {
        presets: [
          // ['@babel/preset-env', { targets: { node: 'current' } }],
          '@nx/next/babel'
        ],
        plugins: ['@babel/plugin-proposal-private-methods']
      }
    ]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/journeys',
  setupFilesAfterEnv: ['<rootDir>setupTests.ts'],
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  preset: '../../jest.preset.js',
  transformIgnorePatterns: [
    `<rootDir>/../../node_modules/(?!(${esmModules.join('|')}))`
  ]
}

export default config
