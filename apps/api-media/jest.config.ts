module.exports = {
  displayName: 'api-media',

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
  coverageDirectory: '../../coverage/apps/api-media',
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  preset: '../../jest.preset.ts'
}
