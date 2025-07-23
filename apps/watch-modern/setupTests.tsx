import '@testing-library/jest-dom'
import 'isomorphic-fetch'
import { configure } from '@testing-library/react'

configure({ asyncUtilTimeout: 2500 })

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  )
}))

Object.defineProperty(
  window.navigator,
  'userAgent',
  ((value) => ({
    get() {
      return value
    },
    set(v) {
      value = v
    }
  }))(window.navigator.userAgent)
)

jest.mock('next/router', () => require('next-router-mock'))

if (process.env['CI'] === 'true')
  jest.retryTimes(3, { logErrorsBeforeRetry: true })
