import type { Config } from 'jest'

const config: Config = {
  displayName: 'watch-modern',
  moduleNameMapper: {
    'swiper/react': '<rootDir>/../__mocks__/swiper/react',
    'swiper/modules': '<rootDir>/../__mocks__/swiper/modules',
    'swiper/css': '<rootDir>/../__mocks__/swiper/css',
    'swiper/css/*': '<rootDir>/../__mocks__/swiper/css'
  },
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/next/babel'] }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/watch-modern',
  setupFilesAfterEnv: ['<rootDir>setupTests.tsx'],
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  preset: '../../jest.preset.js'
}

export default config
