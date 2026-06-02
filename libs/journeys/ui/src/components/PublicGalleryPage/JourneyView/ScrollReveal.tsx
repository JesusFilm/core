import Box from '@mui/material/Box'
import { SxProps, Theme } from '@mui/material/styles'
import { ReactElement, ReactNode, useEffect, useRef, useState } from 'react'

import { usePrefersReducedMotion } from './usePrefersReducedMotion'

type RevealFrom = 'left' | 'right' | 'up'

interface ScrollRevealProps {
  children: ReactNode
  /** Side the element animates in from. */
  from?: RevealFrom
  /** Stagger delay in ms. */
  delay?: number
  /** Travel distance in px before settling. */
  distance?: number
  sx?: SxProps<Theme>
}

/**
 * Reveals its children (fade + directional slide) the first time they scroll
 * into view, using MUI's transition tokens for easing/duration. An
 * IntersectionObserver drives the trigger because MUI's transition
 * components are not scroll-aware. Honours `prefers-reduced-motion`.
 */
export function ScrollReveal({
  children,
  from = 'up',
  delay = 0,
  distance = 48,
  sx
}: ScrollRevealProps): ReactElement {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)
  const reduceMotion = usePrefersReducedMotion()

  useEffect(() => {
    const element = ref.current
    if (element == null) return

    // No observer (jsdom/older browsers) or reduced motion: show immediately.
    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.15 }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [reduceMotion])

  const hiddenTransform =
    from === 'left'
      ? `translateX(-${distance}px)`
      : from === 'right'
        ? `translateX(${distance}px)`
        : `translateY(${distance}px)`

  return (
    <Box
      ref={ref}
      sx={[
        (theme) => ({
          opacity: shown ? 1 : 0,
          transform: shown ? 'none' : hiddenTransform,
          transition: theme.transitions.create(['opacity', 'transform'], {
            duration: 700,
            easing: theme.transitions.easing.easeOut
          }),
          transitionDelay: `${delay}ms`,
          willChange: 'opacity, transform'
        }),
        ...(sx == null ? [] : Array.isArray(sx) ? sx : [sx])
      ]}
    >
      {children}
    </Box>
  )
}
