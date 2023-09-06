import '@testing-library/jest-dom'
import './test/createMatchMedia'
import crypto from 'crypto'

import { configure } from '@testing-library/react'

import { mswServer } from './test/mswServer'

configure({ asyncUtilTimeout: 2500 })

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  )
}))

jest.setTimeout(10000)

Element.prototype.scrollIntoView = jest.fn()

// getRandomValues is required for powerBi unit tests, see issue:
// https://community.powerbi.com/t5/Developer/TypeError-cryptoObj-getRandomValues-is-not-a-function-unrelated/m-p/1963294
Object.defineProperty(window.self, 'crypto', {
  value: {
    getRandomValues: (arr) => crypto.randomBytes(arr.length)
  }
})

beforeAll(() => mswServer.listen())
afterEach(() => mswServer.resetHandlers())
afterAll(() => mswServer.close())

jest.mock('next/router', () => require('next-router-mock'))
