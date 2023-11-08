import type { Config } from 'jest'

const config: Config = {
  displayName: 'nest/powerBi',
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
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/nest/powerBi',
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  preset: '../../../jest.preset.js'
}

export default config
