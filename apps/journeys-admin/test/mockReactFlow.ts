// To make sure that the tests are working, it's important that you are using
// this implementation of ResizeObserver and DOMMatrixReadOnly
// Documentation: https://reactflow.dev/learn/advanced-use/testing#using-jest

import noop from 'lodash/noop'

class ResizeObserver {
  callback: globalThis.ResizeObserverCallback

  constructor(callback: globalThis.ResizeObserverCallback) {
    this.callback = callback
  }

  observe(target: Element): void {
    // @ts-expect-error: provide override for @xyflow/react
    const callbackParam: globalThis.ResizeObserverEntry = { target }
    this.callback([callbackParam], this)
  }

  unobserve = noop

  disconnect = noop
}

class DOMMatrixReadOnly {
  m22: number
  constructor(transform: string) {
    const scale = transform?.match(/scale\(([1-9.])\)/)?.[1]
    this.m22 = scale !== undefined ? +scale : 1
  }
}

// Only run the shim once when requested
let init = false

export const mockReactFlow = (): void => {
  if (init) return
  init = true

  // Define ResizeObserver globally
  if (typeof global.ResizeObserver === 'undefined') {
    global.ResizeObserver = ResizeObserver
  }

  // Define DOMMatrixReadOnly globally
  if (typeof global.DOMMatrixReadOnly === 'undefined') {
    // @ts-expect-error: provide override for @xyflow/react
    global.DOMMatrixReadOnly = DOMMatrixReadOnly
  }

  Object.defineProperties(global.HTMLElement.prototype, {
    offsetHeight: {
      get() {
        return Number.parseFloat(this.style.height as string) || 0
      }
    },
    offsetWidth: {
      get() {
        return Number.parseFloat(this.style.width as string) || 0
      }
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(global.SVGElement as any).prototype.getBBox = () => ({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  })
}

// Initialize the mock immediately to ensure it's available for all tests
mockReactFlow()
