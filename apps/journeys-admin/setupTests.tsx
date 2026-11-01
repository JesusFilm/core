import '@testing-library/jest-dom/vitest'
import 'isomorphic-fetch'
import './test/createMatchMedia'
import crypto from 'crypto'
import { ReadableStream, TransformStream, WritableStream } from 'stream/web'

import { MockLink } from '@apollo/client/testing'
import { configure } from '@testing-library/react'

import { mswServer } from './test/mswServer'
import './test/i18n'

// Apollo Client 4 gives unspecified mocks a "realistic" random delay of
// 20-50ms. The suite was written against v3's immediate responses, so restore
// that default; individual mocks can still opt into a `delay`.
MockLink.defaultOptions = { delay: 0 }

if (typeof globalThis.TransformStream === 'undefined') {
  Object.assign(globalThis, { ReadableStream, TransformStream, WritableStream })
}

configure({ asyncUtilTimeout: 2500 })
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

vi.mock('next/image', () => ({
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

Element.prototype.scrollIntoView = vi.fn()

// jsdom does not implement these URL helpers; provide stubs so components and
// tests that create/revoke object URLs (and spy on them) work under vitest.
if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = vi.fn(() => 'blob:mock-url')
}
if (typeof URL.revokeObjectURL === 'undefined') {
  URL.revokeObjectURL = vi.fn()
}

// jsdom's Blob lacks the promise-based readers browsers have; image uploads
// read file contents with them to check the file really is an image.
function readBlob<T extends 'readAsArrayBuffer' | 'readAsText'>(
  blob: Blob,
  method: T
): Promise<T extends 'readAsText' ? string : ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as never)
    reader.onerror = () => reject(reader.error)
    reader[method](blob)
  })
}
if (typeof Blob.prototype.arrayBuffer === 'undefined') {
  Blob.prototype.arrayBuffer = function (this: Blob) {
    return readBlob(this, 'readAsArrayBuffer')
  }
}
if (typeof Blob.prototype.text === 'undefined') {
  Blob.prototype.text = function (this: Blob) {
    return readBlob(this, 'readAsText')
  }
}

// getRandomValues is required for powerBi unit tests, see issue:
// https://community.powerbi.com/t5/Developer/TypeError-cryptoObj-getRandomValues-is-not-a-function-unrelated/m-p/1963294
Object.defineProperty(window.self, 'crypto', {
  value: {
    getRandomValues: (arr: unknown[]) => {
      crypto.randomBytes(arr.length)
    }
  }
})

Object.defineProperty(document, 'visibilityState', {
  writable: true,
  configurable: true,
  value: 'visible'
})
Object.defineProperty(document, 'clearImmediate', {
  writable: true,
  configurable: true,
  value: vi.fn()
})

beforeAll(() => mswServer.listen())
afterEach(() => {
  mswServer.resetHandlers()
  sessionStorage.clear()
})
afterAll(() => mswServer.close())

vi.mock(
  'next/router',
  () => import(/* webpackChunkName: "next-router-mock" */ 'next-router-mock')
)
