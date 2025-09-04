import type { Config } from 'jest'

const config: Config = {
  displayName: 'watch-modern',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/data/(.*)$': '<rootDir>/src/data/$1',
    'swiper/react': '<rootDir>/../__mocks__/swiper/react',
    'swiper/modules': '<rootDir>/../__mocks__/swiper/modules',
    'swiper/css': '<rootDir>/../__mocks__/swiper/css',
    'swiper/css/*': '<rootDir>/../__mocks__/swiper/css'
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/next/babel'] }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@t3-oss|@algolia|algoliasearch)/)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/watch-modern',
  setupFilesAfterEnv: ['<rootDir>setupTests.tsx'],
  testEnvironment: 'jsdom',
  collectCoverage: false, // Disable for now to focus on functionality
  preset: '../../jest.preset.js'
}

export default config
