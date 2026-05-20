import type { Config } from 'jest'

const config: Config = {
  displayName: 'dev-hosts',
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/js/babel'] }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/shared/dev-hosts',
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  preset: '../../../jest.preset.js'
}

export default config
