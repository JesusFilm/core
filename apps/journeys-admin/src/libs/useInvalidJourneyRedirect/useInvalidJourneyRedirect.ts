import { useEffect } from 'react'
import { useRouter } from 'next/router'

export const useInvalidJourneyRedirect = (data): void => {
  const router = useRouter()
  useEffect(() => {
    const checkValidJourney = (): void => {
      data?.journey == null && data?.journey !== undefined && router.push('/')
    }
    checkValidJourney()
  }, [data, router])
}
