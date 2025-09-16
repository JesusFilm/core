import '@testing-library/jest-dom'
import 'web-streams-polyfill/polyfill' // Added for Web Streams API

jest.mock('next/router', () => require('next-router-mock'))

if (process.env.CI === 'true')
  jest.retryTimes(3, { logErrorsBeforeRetry: true })
