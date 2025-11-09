import type { Config } from 'jest'

const config: Config = {
  displayName: 'lumina',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/next/babel'] }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/lumina',
  setupFilesAfterEnv: ['<rootDir>setupTests.tsx'],
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  preset: '../../jest.preset.js'
}

export default config

