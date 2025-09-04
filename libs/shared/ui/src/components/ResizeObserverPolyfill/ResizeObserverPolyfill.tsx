'use client'

import { useEffect } from 'react'

export function useResizeObserverPolyfill(): void {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if ((window as any).ResizeObserver != null) return

    void import('resize-observer-polyfill').then((mod) => {
      ;(window as any).ResizeObserver = mod.default
    })
  }, [])
}

export function ResizeObserverPolyfill(): null {
  useResizeObserverPolyfill()
  return null
}

export default ResizeObserverPolyfill
