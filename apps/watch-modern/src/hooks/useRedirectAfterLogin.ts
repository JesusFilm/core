import { useRouter } from 'next/router'
import { useCallback } from 'react'

const isSafeRedirect = (target: string, origin: string): boolean => {
  try {
    const url = new URL(target)
    return url.origin === origin
  } catch {
    try {
      const fallback = new URL(target, origin)
      return fallback.origin === origin
    } catch {
      return false
    }
  }
}

export function useRedirectAfterLogin(): (fallbackUrl?: string) => Promise<void> {
  const router = useRouter()
  const redirectParam = router.query['redirect']

  return useCallback(
    async (fallbackUrl: string = '/studio/new') => {
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const encodedRedirect =
        typeof redirectParam === 'string' ? redirectParam : undefined
      let redirectCandidate: string | undefined

      if (encodedRedirect != null) {
        try {
          redirectCandidate = decodeURIComponent(encodedRedirect)
        } catch (error) {
          console.warn('Failed to decode redirect parameter. Falling back to default.', error)
        }
      }

      const destination =
        redirectCandidate && origin && isSafeRedirect(redirectCandidate, origin)
          ? redirectCandidate
          : fallbackUrl

      await router.replace(destination)
    },
    [redirectParam, router]
  )
}
