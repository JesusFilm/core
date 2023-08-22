import type { Config } from 'jest'

const config: Config = {
  displayName: 'api-journeys',
  globals: {},
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json'
      }
    ]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/api-journeys',
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  preset: '../../jest.preset.js'
}

export default config
