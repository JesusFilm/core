import type { Config } from 'jest'

const config: Config = {
  displayName: 'journeys-ui',
  moduleNameMapper: {
    'swiper/react': '<rootDir>/../../../apps/__mocks__/swiper/react',
    'swiper/modules': '<rootDir>/../../../apps/__mocks__/swiper/modules',
    'swiper/css': '<rootDir>/../../../apps/__mocks__/swiper/css',
    'swiper/css/*': '<rootDir>/../../../apps/__mocks__/swiper/css',
    'use-stick-to-bottom':
      '<rootDir>/../../../apps/__mocks__/use-stick-to-bottom',
    streamdown: '<rootDir>/../../../apps/__mocks__/streamdown'
  },
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@ai-sdk|ai|use-stick-to-bottom|streamdown)/)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/journeys/ui',
  setupFilesAfterEnv: ['<rootDir>setupTests.ts'],
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  preset: '../../../jest.preset.js',
  testEnvironment: 'jest-fixed-jsdom'
}

export default config
