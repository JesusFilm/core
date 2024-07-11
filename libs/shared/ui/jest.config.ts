import type { Config } from 'jest'

const config: Config = {
  displayName: 'shared-ui',
  moduleNameMapper: {
    'swiper/react': '<rootDir>/../../../apps/__mocks__/swiper/react',
    'swiper/modules': '<rootDir>/../../../apps/__mocks__/swiper/modules',
    'swiper/css': '<rootDir>/../../../apps/__mocks__/swiper/css',
    'swiper/css/*': '<rootDir>/../../../apps/__mocks__/swiper/css'
  },
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/shared/ui',
  setupFilesAfterEnv: ['<rootDir>setupTests.ts'],
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  preset: '../../../jest.preset.js'
}

export default config
