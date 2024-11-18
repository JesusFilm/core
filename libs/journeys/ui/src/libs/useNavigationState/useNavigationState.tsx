import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export function useNavigationState() {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    function handleRouteChangeStart() {
      setIsNavigating(true)
    }

    function handleRouteChangeComplete() {
      setIsNavigating(false)
    }

    router.events.on('routeChangeStart', handleRouteChangeStart)
    router.events.on('routeChangeComplete', handleRouteChangeComplete)

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart)
      router.events.off('routeChangeComplete', handleRouteChangeComplete)
    }
  }, [router])

  return isNavigating
}
