import '@testing-library/jest-dom'
import 'isomorphic-fetch'
import './test/createMatchMedia'
import crypto from 'crypto'

import { configure } from '@testing-library/react'

import { mswServer } from './test/mswServer'
import './test/i18n'

configure({ asyncUtilTimeout: 2500 })

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, priority, className }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      role="img"
      rel={priority === true ? 'preload' : undefined}
      className={className}
    />
  )
}))

jest.setTimeout(10000)

Element.prototype.scrollIntoView = jest.fn()

// getRandomValues is required for powerBi unit tests, see issue:
// https://community.powerbi.com/t5/Developer/TypeError-cryptoObj-getRandomValues-is-not-a-function-unrelated/m-p/1963294
Object.defineProperty(window.self, 'crypto', {
  value: {
    getRandomValues: (arr: unknown[]) => {
      crypto.randomBytes(arr.length)
    }
  }
})

beforeAll(() => mswServer.listen())
afterEach(() => mswServer.resetHandlers())
afterAll(() => mswServer.close())

jest.mock('next/router', () => require('next-router-mock'))

if (process.env.CI === 'true')
  jest.retryTimes(3, { logErrorsBeforeRetry: true })
