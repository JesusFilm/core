import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { trackRecentlyOpenedJourney } from '../../components/JourneyList/JourneySort/utils/trackRecentlyOpenedJourney'

export function useTrackRecentlyOpenedJourney(): void {
  const router = useRouter()

  useEffect(() => {
    const handleRouteChange = (url: string): void => {
      // Match /journeys/[journeyId] or /templates/[journeyId] (including sub-routes)
      const journeyMatch = url.match(/^\/(?:journeys|templates)\/([^/?]+)/)
      if (journeyMatch != null && journeyMatch[1] != null) {
        const journeyId = journeyMatch[1]
        trackRecentlyOpenedJourney(journeyId)
      }
    }

    // Track initial route if it's a journey page
    if (router.isReady) {
      handleRouteChange(router.asPath)
    }

    // Track route changes
    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router])
}
