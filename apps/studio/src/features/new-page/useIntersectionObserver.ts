import { useEffect, useState } from 'react'

type IntersectionObserverCallback = () => void

type UseIntersectionObserverReturn = {
  ref: (element: Element | null) => void
}

export const useIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): UseIntersectionObserverReturn => {
  const [element, setElement] = useState<Element | null>(null)
  const [hasTriggered, setHasTriggered] = useState(false)

  useEffect(() => {
    if (!element || hasTriggered) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callback()
          setHasTriggered(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, ...options }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [element, callback, hasTriggered, options])

  return { ref: setElement }
}
