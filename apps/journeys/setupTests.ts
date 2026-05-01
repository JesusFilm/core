import '@testing-library/jest-dom/vitest'
import { ReadableStream, TransformStream, WritableStream } from 'stream/web'

import { configure } from '@testing-library/react'

if (typeof globalThis.TransformStream === 'undefined') {
  Object.assign(globalThis, { ReadableStream, TransformStream, WritableStream })
}

configure({ asyncUtilTimeout: 2500 })

vi.mock('next/router', () => import('next-router-mock'))
