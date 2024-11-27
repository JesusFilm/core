import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export function useNavigationState(): boolean {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    const handleStart = () => setIsNavigating(true)
    const handleComplete = () => setIsNavigating(false)

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleComplete)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleComplete)
      router.events.off('routeChangeError', handleComplete)
    }
  }, [router])

  return isNavigating
}
