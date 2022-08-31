/* eslint-disable */
export default {
  displayName: 'journeys-ui',
  preset: '../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nrwl/react/babel'] }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/journeys/ui',
  setupFilesAfterEnv: ['<rootDir>setupTests.ts']
}
