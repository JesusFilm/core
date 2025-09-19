'use client'

import { useEffect } from 'react'

// Ensure ResizeObserver exists as early as possible in tests
declare const window: any
declare const globalThis: any
if (
  typeof window !== 'undefined' &&
  (window.ResizeObserver == null || globalThis.ResizeObserver == null)
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Mod = require('resize-observer-polyfill')
    const Polyfill = Mod?.default ?? Mod
    if (typeof Polyfill === 'function') {
      window.ResizeObserver = Polyfill
      globalThis.ResizeObserver = Polyfill
    }
  } catch {
    // noop - will attempt dynamic import in useEffect below
  }
}

export function useResizeObserverPolyfill(): void {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.ResizeObserver != null) return

    void import(
      /* webpackChunkName: "resize-observer-polyfill" */ 'resize-observer-polyfill'
    ).then((mod) => {
      window.ResizeObserver = mod.default
    })
  }, [])
}

export function ResizeObserverPolyfill(): null {
  useResizeObserverPolyfill()
  return null
}

export default ResizeObserverPolyfill
