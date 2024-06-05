import type { Config } from 'jest'
// change something so env can be created
const config: Config = {
  displayName: 'journeys-admin',
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
  coverageDirectory: '../../coverage/apps/journeys-admin',
  setupFilesAfterEnv: ['<rootDir>setupTests.tsx'],
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  preset: '../../jest.preset.js'
}

export default config
