import type { Config } from 'jest'

const config: Config = {
  injectGlobals: true,
  displayName: 'api-journeys-modern',
  globals: {},
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json'
      }
    ],
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['ts-jest', { presets: ['@nx/next/babel'] }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apis/api-journeys-modern',
  collectCoverageFrom: ['src/**/*.{ts,js}', '!src/**/*.spec.ts'],
  coverageReporters: ['cobertura'],
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/test/prismaMock.ts'],
  transformIgnorePatterns: ['node_modules/(?!(@react-email/render)/)'],
  moduleNameMapper: {
    '@react-email/render': '<rootDir>/test/reactEmailRenderMock.ts'
  }
}

export default config
