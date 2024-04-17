import '@testing-library/jest-dom'

if (process.env.CI === 'true')
  jest.retryTimes(3, { logErrorsBeforeRetry: true })
