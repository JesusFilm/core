import { useEffect, useState } from 'react'

/**
 * Custom hook that determines if an element is in the viewport
 * @param ref React ref object pointing to the HTML element to observe
 * @returns boolean indicating whether the element is currently in viewport
 */
export const useIsInViewport = (ref: React.RefObject<HTMLElement>): boolean => {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      {
        // Safari-friendly rootMargin
        // This creates a detection zone in the middle 50% of the screen
        rootMargin: '-25% 0px -25% 0px',
        threshold: [0, 0.1, 0.5, 1.0]
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [ref])

  return isIntersecting
}
