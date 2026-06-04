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
  /**
   * Render the children fully revealed immediately with no animation —
   * used by static surfaces like the admin preview that share the live
   * layout but skip the reveal-on-scroll choreography.
   */
  disabled?: boolean
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
  disabled = false,
  sx
}: ScrollRevealProps): ReactElement {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = usePrefersReducedMotion()
  // Skip the brief opacity-0 flash on disabled / reduced-motion mounts by
  // initialising the shown state synchronously to the final value.
  const [shown, setShown] = useState<boolean>(() => disabled || reduceMotion)

  useEffect(() => {
    const element = ref.current
    if (element == null) return

    // Decorative use, no observer (jsdom/older browsers), or reduced motion:
    // show immediately and don't attach the observer.
    if (
      disabled ||
      reduceMotion ||
      typeof IntersectionObserver === 'undefined'
    ) {
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
  }, [reduceMotion, disabled])

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
          // Under reduced motion or decorative use the element is shown
          // immediately, so any remaining transition would animate the
          // "instant" reveal over its full duration. Force `none` then.
          transition:
            reduceMotion || disabled
              ? 'none'
              : theme.transitions.create(['opacity', 'transform'], {
                  duration: 700,
                  easing: theme.transitions.easing.easeOut
                }),
          transitionDelay: reduceMotion || disabled ? '0ms' : `${delay}ms`,
          willChange: reduceMotion || disabled ? 'auto' : 'opacity, transform'
        }),
        ...(sx == null ? [] : Array.isArray(sx) ? sx : [sx])
      ]}
    >
      {children}
    </Box>
  )
}
