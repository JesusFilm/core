module.exports = {
  displayName: 'api-tags',

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
  coverageDirectory: '../../coverage/apps/api-tags',
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  preset: '../../jest.preset.ts'
}
