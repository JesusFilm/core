import '@testing-library/jest-dom/vitest'
import 'isomorphic-fetch'
import { configure } from '@testing-library/react'

import { server } from './test/mswServer'
import './test/i18n'

configure({ asyncUtilTimeout: 2500 })
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, unoptimized }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      data-unoptimized={unoptimized === true ? 'true' : undefined}
    />
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

vi.mock(
  'next/router',
  () => import(/* webpackChunkName: "next-router-mock" */ 'next-router-mock')
)

// Mock ResizeObserver for components that use it
class ResizeObserverMock {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  observe(): void {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  unobserve(): void {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect(): void {}
}

global.ResizeObserver = ResizeObserverMock

// Mock scrollIntoView for better test compatibility
if (
  window.HTMLElement != null &&
  window.HTMLElement.prototype.scrollIntoView == null
) {
  Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    writable: true,
    value: vi.fn()
  })
}

// Start/stop MSW for node test env
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
