import { useRouter } from 'next/router'
import { useEffect } from 'react'

export const useInvalidJourneyRedirect = (data): void => {
  const router = useRouter()

  useEffect(() => {
    const checkValidJourney = async (): Promise<void> => {
      if (
        data?.journey === null ||
        data?.template === null ||
        data?.publisherTemplate === null
      )
        await router.push('/')
    }
    void checkValidJourney()
  }, [data, router])
}
