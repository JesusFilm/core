import { ReadableStream, TransformStream, WritableStream } from 'stream/web'

import { MockLink } from '@apollo/client/testing'
import '@testing-library/jest-dom/vitest'
import { configure } from '@testing-library/react'

// Apollo Client 4 gives unspecified mocks a "realistic" random delay of
// 20-50ms. The suite was written against v3's immediate responses, so restore
// that default; individual mocks can still opt into a `delay`.
MockLink.defaultOptions = { delay: 0 }

if (typeof globalThis.TransformStream === 'undefined') {
  Object.assign(globalThis, { ReadableStream, TransformStream, WritableStream })
}

configure({ asyncUtilTimeout: 2500 })

// jsdom lacks the layout and pointer APIs Base UI popups (Select, Combobox,
// Dialog, Tooltip, Menu) rely on. Stub them so the components mount and open.
if (typeof globalThis.ResizeObserver === 'undefined') {
  class ResizeObserverStub {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  }
  Object.assign(globalThis, { ResizeObserver: ResizeObserverStub })
}

if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => false)
    })
  })
}

if (
  typeof Element !== 'undefined' &&
  typeof Element.prototype.scrollIntoView !== 'function'
) {
  Element.prototype.scrollIntoView = vi.fn()
}

if (
  typeof MouseEvent !== 'undefined' &&
  typeof globalThis.PointerEvent === 'undefined'
) {
  class PointerEventStub extends MouseEvent {
    readonly pointerId: number
    readonly pointerType: string
    readonly isPrimary: boolean
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init)
      this.pointerId = init.pointerId ?? 1
      this.pointerType = init.pointerType ?? 'mouse'
      this.isPrimary = init.isPrimary ?? true
    }
  }
  Object.assign(globalThis, { PointerEvent: PointerEventStub })
}

if (
  typeof Element !== 'undefined' &&
  typeof Element.prototype.getAnimations !== 'function'
) {
  // Base UI waits for exit animations before unmounting popups.
  Element.prototype.getAnimations = vi.fn(() => [])
}

if (
  typeof Element !== 'undefined' &&
  typeof Element.prototype.hasPointerCapture !== 'function'
) {
  Element.prototype.hasPointerCapture = vi.fn(() => false)
  Element.prototype.setPointerCapture = vi.fn()
  Element.prototype.releasePointerCapture = vi.fn()
}

vi.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }) => <img src={src} alt={alt} />
}))
