import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { RefObject, useEffect, useRef } from 'react'

import { useScrollSubscription } from './scrollContext'

/**
 * Viewport-relative parallax that closes the gap between sections as you
 * scroll: the leaving (upper) section lags — scrolling slower — while the
 * arriving (lower) section is pulled up toward it, so neighbouring sections
 * draw together as a boundary crosses the viewport. Strength is the peak
 * offset as a fraction of the viewport height, lighter on mobile (xs/sm)
 * than on desktop. Offset is 0 when centred, so each section reads normally
 * when it's the focus.
 *
 * Driven by the shared `ScrollProvider` so three parallax refs + the nav's
 * border-fade ride one window scroll listener, not four. The callback
 * short-circuits on three conditions:
 *   1. Reduced motion is on — and toggling it ON mid-session flushes any
 *      lingering transform via a separate effect (the scroll callback alone
 *      can't help when the user is idle).
 *   2. The element is well above or below the viewport — parallax has
 *      clamped to its bound; no point recomputing while it's off-screen.
 *   3. The computed transform matches the last one applied — avoids a
 *      string allocation + style write per rAF tick on low-end devices.
 */
export function useParallax(
  desktopStrength = 0.06,
  mobileStrength = 0.03
): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null)
  const cachedTransform = useRef<string>('')
  const { breakpoints } = useTheme()
  const mobileMaxWidth = breakpoints.values.md
  // `useMediaQuery` defaults `defaultMatches` to `false` for SSR safety;
  // it resolves to the real value (and re-renders) once mounted, and
  // subscribes to `matchMedia('change')` so the parallax stops mid-session
  // when the user flips the OS setting.
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  // Flush any lingering transform when reduce-motion flips ON. The scroll
  // callback only fires on actual scroll, so an idle user would otherwise
  // be stuck with the last-applied offset until the next scroll event.
  useEffect(() => {
    if (!reduceMotion) return
    const element = ref.current
    if (element == null) return
    if (cachedTransform.current === '') return
    element.style.transform = ''
    cachedTransform.current = ''
  }, [reduceMotion])

  useScrollSubscription(() => {
    const element = ref.current
    if (element == null) return
    if (reduceMotion) {
      if (cachedTransform.current === '') return
      element.style.transform = ''
      cachedTransform.current = ''
      return
    }
    const viewport = window.innerHeight || 1
    const rect = element.getBoundingClientRect()
    // Off-screen short-circuit: well above or well below the viewport
    // means parallax has clamped to its bound already.
    if (rect.bottom < -viewport || rect.top > 2 * viewport) return
    // xs/sm get the gentler drift; md+ the full strength.
    const strength =
      window.innerWidth < mobileMaxWidth ? mobileStrength : desktopStrength
    // -1 (well above the viewport) … 0 (centred) … 1 (well below)
    const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport
    const clamped = Math.max(-1, Math.min(1, progress))
    // Negative sign: below-centre content lifts (catches up to the section
    // above) and above-centre content sinks (lags), shrinking the gap.
    const next = `translateY(${(-clamped * strength * viewport).toFixed(1)}px)`
    // Same-value short-circuit: no point reassigning the same string.
    if (next === cachedTransform.current) return
    cachedTransform.current = next
    element.style.transform = next
  })

  return ref
}
