import type { Config } from 'jest'

const config: Config = {
  displayName: 'studio',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/next/babel'] }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/studio',
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  preset: '../../jest.preset.js',
  testEnvironment: 'jest-fixed-jsdom'
}

export default config
