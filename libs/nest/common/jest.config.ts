/* eslint-disable */
export default {
  displayName: 'nest-common',

  globals: {},
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json'
      }
    ]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/nest/common',
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  preset: '../../../jest.preset.js'
}
