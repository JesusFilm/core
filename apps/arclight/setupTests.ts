import '@testing-library/jest-dom/vitest'
import { ReadableStream, TransformStream, WritableStream } from 'stream/web'

import { configure } from '@testing-library/react'

if (typeof globalThis.TransformStream === 'undefined') {
  Object.assign(globalThis, { ReadableStream, TransformStream, WritableStream })
}

configure({ asyncUtilTimeout: 2500 })

// arclight is an App Router app (src/app/, no src/pages/), so we do not mock
// next/router. App Router tests should mock next/navigation instead, e.g.:
//   vi.mock('next/navigation', () => ({
//     useRouter: vi.fn(),
//     usePathname: vi.fn(),
//     useSearchParams: vi.fn()
//   }))
