module.exports = {
  displayName: 'api-languages',

  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json'
    }
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/api-languages',
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  preset: '../../jest.preset.ts'
}
