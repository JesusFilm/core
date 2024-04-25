import type { Config } from 'jest'
const config: Config = {
  displayName: 'api-videos',
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
  modulePathIgnorePatterns: [
    '<rootDir>/src/app/modules/bigQuery/bigQuery.queue.test.ts'
  ],
  coverageDirectory: '../../coverage/apps/api-videos',
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  preset: '../../jest.preset.js'
}

export default config
