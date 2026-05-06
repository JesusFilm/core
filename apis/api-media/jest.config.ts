import type { Config } from 'jest'

const config: Config = {
  displayName: 'api-media',
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
  coverageDirectory: '../../coverage/apis/api-media',
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: [
    '<rootDir>/test/crowdinMock.ts',
    '<rootDir>/test/bullmqMock.ts',
    '<rootDir>/test/prismaMock.ts'
  ]
}

export default config
