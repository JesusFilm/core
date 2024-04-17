import { UseSuspenseQueryResult, useSuspenseQuery } from '@apollo/client'

import {
  GetAdminJourneys,
  GetAdminJourneysVariables
} from '../../../__generated__/GetAdminJourneys'
import { GET_ADMIN_JOURNEYS } from '../useAdminJourneysQuery/useAdminJourneysQuery'

export function useAdminJourneysSuspenseQuery(
  variables?: GetAdminJourneysVariables
): UseSuspenseQueryResult<GetAdminJourneys, GetAdminJourneysVariables> {
  const query = useSuspenseQuery<GetAdminJourneys, GetAdminJourneysVariables>(
    GET_ADMIN_JOURNEYS,
    {
      variables
    }
  )

  return query
}
