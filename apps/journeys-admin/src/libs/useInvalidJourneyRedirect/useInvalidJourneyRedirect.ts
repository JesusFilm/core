import { useEffect } from 'react'
import { useRouter } from 'next/router'

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
