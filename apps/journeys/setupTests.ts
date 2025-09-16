import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'
import 'web-streams-polyfill/polyfill'

configure({ asyncUtilTimeout: 2500 })

jest.mock('next/router', () => require('next-router-mock'))

if (process.env.CI === 'true')
  jest.retryTimes(3, { logErrorsBeforeRetry: true })
