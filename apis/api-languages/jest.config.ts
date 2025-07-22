import type { Config } from 'jest'

const config: Config = {
  injectGlobals: true,
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
  coverageDirectory: '../../coverage/apis/api-languages',
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/test/prismaMock.ts']
}

export default config
