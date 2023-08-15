module.exports = {
  displayName: 'nest/gqlAuthGuard',

  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json'
    }
  },
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/nest/gqlAuthGuard',
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  preset: '../../../jest.preset.ts'
}
