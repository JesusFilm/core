import '@testing-library/jest-dom/vitest'
import { ReadableStream, TransformStream, WritableStream } from 'stream/web'

import { configure } from '@testing-library/react'

import { server } from './test/mswServer'
import './test/i18n'

if (typeof globalThis.TransformStream === 'undefined') {
  Object.assign(globalThis, { ReadableStream, TransformStream, WritableStream })
}

configure({ asyncUtilTimeout: 2500 })

vi.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => (
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

vi.mock(
  'next/router',
  () => import(/* webpackChunkName: "next-router-mock" */ 'next-router-mock')
)
vi.mock(
  'next/compat/router',
  () => import(/* webpackChunkName: "next-router-mock" */ 'next-router-mock')
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
