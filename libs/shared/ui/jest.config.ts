module.exports = {
  displayName: 'shared-ui',

  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/shared/ui',
  setupFilesAfterEnv: ['<rootDir>setupTests.ts'],
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  preset: '../../../jest.preset.ts'
}
