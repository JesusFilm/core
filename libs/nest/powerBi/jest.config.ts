module.exports = {
  displayName: 'nest/powerBi',

  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json'
    }
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/nest/powerBi',
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  preset: '../../../jest.preset.ts'
}
