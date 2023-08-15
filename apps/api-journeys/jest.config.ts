module.exports = {
  displayName: 'api-journeys',

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
  coverageDirectory: '../../coverage/apps/api-journeys',
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  preset: '../../jest.preset.ts'
}
