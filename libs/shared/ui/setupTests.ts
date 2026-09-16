import '@testing-library/jest-dom/vitest'
import { ReadableStream, TransformStream, WritableStream } from 'stream/web'

import { MockLink } from '@apollo/client/testing'
import { configure } from '@testing-library/react'

// Apollo Client 4 gives unspecified mocks a "realistic" random delay of
// 20-50ms. The suite was written against v3's immediate responses, so restore
// that default; individual mocks can still opt into a `delay`.
MockLink.defaultOptions = { delay: 0 }

if (typeof globalThis.TransformStream === 'undefined') {
  Object.assign(globalThis, { ReadableStream, TransformStream, WritableStream })
}

configure({ asyncUtilTimeout: 2500 })
