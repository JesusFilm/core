import { useSuspenseQuery } from "@apollo/client/react";

import {
  GetAdminJourneys,
  GetAdminJourneysVariables
} from '../../../__generated__/GetAdminJourneys'
import { GET_ADMIN_JOURNEYS } from '../useAdminJourneysQuery/useAdminJourneysQuery'

export function useAdminJourneysSuspenseQuery(
  variables?: GetAdminJourneysVariables
): useSuspenseQuery.Result<GetAdminJourneys, GetAdminJourneysVariables> {
  const query = useSuspenseQuery<GetAdminJourneys, GetAdminJourneysVariables>(
    GET_ADMIN_JOURNEYS,
    {
      variables
    }
  )

  return query
}
