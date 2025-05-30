/* eslint-disable */
export default {
  displayName: 'media-transcoder',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apis/media-transcoder',
  collectCoverageFrom: ['src/**/*.ts', '!src/main.ts', '!src/**/*.d.ts']
}
