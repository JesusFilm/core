import type { Config } from 'jest'

const config: Config = {
  displayName: 'api-journeys-modern',
  globals: {},
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json'
      }
    ],
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['ts-jest', { presets: ['@nx/next/babel'] }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/api-journeys-modern',
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/test/prismaMock.ts']
}

export default config
