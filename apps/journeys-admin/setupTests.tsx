import '@testing-library/jest-dom'
import './test/createMatchMedia'
import crypto from 'crypto'
import { configure } from '@testing-library/react'

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

Object.defineProperty(window.self, 'crypto', {
  value: {
    getRandomValues: (arr) => crypto.randomBytes(arr.length)
  }
})
