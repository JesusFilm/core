module.exports = {
  displayName: 'journey-ui',
  preset: '../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/journey/ui',
  setupFilesAfterEnv: ['<rootDir>setupTests.ts']
}
