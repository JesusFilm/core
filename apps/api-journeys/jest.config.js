module.exports = {
  displayName: 'api-journeys',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/api-journeys',
  setupFilesAfterEnv: ['<rootDir>tests/setup.ts'],
  testEnvironment: './tests/prismaEnvironment.ts',
};
