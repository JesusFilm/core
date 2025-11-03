import type { Config } from 'jest'

const config: Config = {
  displayName: 'api-lumina',
  globals: {},
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json'
      }
    ]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
  coverageDirectory: '../../coverage/apis/api-lumina',
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: [
    '<rootDir>/test/stripeMock.ts',
    '<rootDir>/test/prismaMock.ts'
  ]
}

export default config
