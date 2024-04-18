/* eslint-disable */
export default {
  displayName: 'api-arclight',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/api-arclight',
  collectCoverage: true,
  coverageReporters: ['cobertura']
}
