import type { Config } from 'jest'

const config: Config = {
  displayName: 'nexus-admin',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/next/babel'] }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  setupFilesAfterEnv: ['<rootDir>setupTests.tsx'],
  preset: '../../jest.preset.js',
  coverageDirectory: '../../coverage/apps/nexus-admin'
}

export default config
