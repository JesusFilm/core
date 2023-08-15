module.exports = {
  displayName: 'nest-decorators',

  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json'
    }
  },
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/nest/decorators',
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  preset: '../../../jest.preset.ts'
}
