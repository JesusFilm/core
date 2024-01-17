import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

configure({ asyncUtilTimeout: 2500 })

jest.mock('next/router', () => require('next-router-mock'))

if (process.env.CI === 'true')
  jest.retryTimes(3, { logErrorsBeforeRetry: true })
;['requestFullscreen', 'exitFullscreen'].forEach(
  (each) => (document.documentElement[each] = jest.fn())
)
