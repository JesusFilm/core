import type { Config } from 'jest'

const config: Config = {
  displayName: 'api-languages',
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
  coverageDirectory: '../../coverage/apps/api-languages',
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  preset: '../../jest.preset.js'
}

export default config
