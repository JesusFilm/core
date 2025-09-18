import { useEffect, useRef, useState } from 'react'

interface UseCountdownOptions {
  isRunning: boolean
  initialCount: number
  onComplete?: () => void
}

export function useCountdown({
  isRunning,
  initialCount,
  onComplete
}: UseCountdownOptions): number | null {
  const [count, setCount] = useState<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const latestOnComplete = useRef(onComplete)

  useEffect(() => {
    latestOnComplete.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current != null) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setCount(null)
      return
    }

    const nextValue = Math.max(Math.ceil(initialCount), 0)
    setCount((previous) => {
      if (previous == null || previous > nextValue) return nextValue
      return previous
    })

    if (timerRef.current != null) return

    timerRef.current = setInterval(() => {
      setCount((previous) => {
        if (previous == null) return previous
        if (previous <= 1) {
          if (timerRef.current != null) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }
          latestOnComplete.current?.()
          return 0
        }
        return previous - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current != null) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [initialCount, isRunning])

  return count
}
