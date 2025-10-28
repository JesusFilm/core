import { useCallback, useEffect, useMemo, useState } from 'react'

type GuestUsage = {
  count: number
  resetAt: number
}

const STORAGE_KEY = 'watchModern.guestPromptUsage'
export const GUEST_PROMPT_LIMIT = 5

const getDefaultUsage = (): GuestUsage => ({
  count: 0,
  resetAt: Date.now() + 24 * 60 * 60 * 1000
})

const readFromStorage = (): GuestUsage => {
  if (typeof window === 'undefined') return getDefaultUsage()

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (raw == null) return getDefaultUsage()

  try {
    const parsed = JSON.parse(raw) as GuestUsage
    if (typeof parsed.resetAt !== 'number' || typeof parsed.count !== 'number') {
      throw new Error('Invalid shape')
    }

    if (Date.now() > parsed.resetAt) {
      return getDefaultUsage()
    }

    return parsed
  } catch (error) {
    console.warn('Failed to parse guest prompt usage from storage. Resetting.', error)
    return getDefaultUsage()
  }
}

export const useGuestPromptLimit = (isAuthenticated: boolean) => {
  const [usage, setUsage] = useState<GuestUsage>(getDefaultUsage)

  useEffect(() => {
    if (isAuthenticated) {
      setUsage(getDefaultUsage())
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY)
      }
      return
    }

    setUsage(readFromStorage())
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated || typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(usage))
  }, [isAuthenticated, usage])

  const isAtLimit = useMemo(() => usage.count >= GUEST_PROMPT_LIMIT, [usage.count])

  const remaining = useMemo(
    () => (isAuthenticated ? Infinity : Math.max(GUEST_PROMPT_LIMIT - usage.count, 0)),
    [isAuthenticated, usage.count]
  )

  const registerPrompt = useCallback(() => {
    setUsage((prev) => {
      const now = Date.now()
      if (now > prev.resetAt) {
        return {
          count: 1,
          resetAt: now + 24 * 60 * 60 * 1000
        }
      }

      return {
        ...prev,
        count: Math.min(prev.count + 1, GUEST_PROMPT_LIMIT)
      }
    })
  }, [])

  return {
    usage,
    isAtLimit,
    remaining,
    registerPrompt
  }
}
