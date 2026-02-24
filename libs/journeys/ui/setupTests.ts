import '@testing-library/jest-dom'

jest.mock('next/router', () => require('next-router-mock'))

// Mock ResizeObserver for components that use it
class ResizeObserverMock {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  observe(): void {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  unobserve(): void {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect(): void {}
}

global.ResizeObserver = ResizeObserverMock

if (process.env.CI === 'true')
  jest.retryTimes(3, { logErrorsBeforeRetry: true })
