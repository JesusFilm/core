export default {
  displayName: 'nest-common',

  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json'
    }
  },
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/nest/common',
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  preset: '../../../jest.preset.js'
}
