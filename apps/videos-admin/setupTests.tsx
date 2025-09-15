import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

configure({ asyncUtilTimeout: 2500 })

jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }) => <img src={src} alt={alt} />
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

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    route: '/',
    asPath: '/',
    query: {}
  })
}))

if (process.env.CI === 'true')
  jest.retryTimes(3, { logErrorsBeforeRetry: true })
