import { useCallback } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { useHostCreateMutation } from '../useHostCreateMutation'
import { useUpdateJourneyHostMutation } from '../useUpdateJourneyHostMutation'

export interface HostFormValues {
  title: string
  location?: string
}

export function useHostCreate(): (values: HostFormValues) => Promise<void> {
  const { journey } = useJourney()
  const [hostCreate] = useHostCreateMutation()
  const [journeyHostUpdate] = useUpdateJourneyHostMutation()

  const createHost = useCallback(
    async (values: HostFormValues): Promise<void> => {
      if (journey?.team != null) {
        const { data } = await hostCreate({
          variables: { teamId: journey.team.id, input: values }
        })
        if (data?.hostCreate.id != null) {
          await journeyHostUpdate({
            variables: {
              id: journey?.id,
              input: { hostId: data.hostCreate.id }
            }
          })
        }
      }
    },
    [hostCreate, journey, journeyHostUpdate]
  )

  return createHost
}
