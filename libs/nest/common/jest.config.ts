import type { Config } from 'jest'

const config: Config = {
  injectGlobals: true,
  displayName: 'nest-common',
  globals: {},
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json'
      }
    ],
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/nest/common',
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  preset: '../../../jest.preset.js'
}

export default config
