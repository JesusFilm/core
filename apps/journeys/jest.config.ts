import type { Config } from 'jest'

const config: Config = {
  displayName: 'journeys',
  moduleNameMapper: {
    'swiper/react': '<rootDir>/../__mocks__/swiper/react',
    'swiper/modules': '<rootDir>/../__mocks__/swiper/modules',
    'swiper/css': '<rootDir>/../__mocks__/swiper/css',
    'swiper/css/*': '<rootDir>/../__mocks__/swiper/css',
    'use-stick-to-bottom': '<rootDir>/../__mocks__/use-stick-to-bottom',
    streamdown: '<rootDir>/../__mocks__/streamdown'
  },
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/next/babel'] }],
    '^.+\\.mjs$': ['babel-jest', { presets: ['@nx/next/babel'] }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@ai-sdk|ai|use-stick-to-bottom|streamdown)/)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs'],
  coverageDirectory: '../../coverage/apps/journeys',
  setupFiles: ['./jest.polyfills.js'],
  setupFilesAfterEnv: ['<rootDir>setupTests.ts'],
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  preset: '../../jest.preset.js',
  testEnvironment: 'jest-fixed-jsdom'
}

export default config
