import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'
import { ReadableStream, TransformStream, WritableStream } from 'stream/web'

if (typeof globalThis.TransformStream === 'undefined') {
  Object.assign(globalThis, { ReadableStream, TransformStream, WritableStream })
}

configure({ asyncUtilTimeout: 2500 })

jest.mock('next/router', () => require('next-router-mock'))

if (process.env.CI === 'true')
  jest.retryTimes(3, { logErrorsBeforeRetry: true })
