'use client'

import { useEffect } from 'react'

// Ensure ResizeObserver exists as early as possible in tests
declare const window: any
// Aliased rather than redeclared: `declare const globalThis` shadows the real
// global binding, which ESLint 10 reports as no-shadow-restricted-names.
const globalScope = globalThis as any
if (
  typeof window !== 'undefined' &&
  (window.ResizeObserver == null || globalScope.ResizeObserver == null)
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Mod = require('resize-observer-polyfill')
    const Polyfill = Mod?.default ?? Mod
    if (typeof Polyfill === 'function') {
      window.ResizeObserver = Polyfill
      globalScope.ResizeObserver = Polyfill
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
