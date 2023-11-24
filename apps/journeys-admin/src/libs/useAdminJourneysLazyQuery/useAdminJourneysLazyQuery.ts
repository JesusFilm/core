import { LazyQueryResultTuple, useLazyQuery } from '@apollo/client'

import {
  GetAdminJourneys,
  GetAdminJourneysVariables
} from '../../../__generated__/GetAdminJourneys'
import { GET_ADMIN_JOURNEYS } from '../useAdminJourneysQuery/useAdminJourneysQuery'

export function useAdminJourneysLazyQuery(): LazyQueryResultTuple<
  GetAdminJourneys,
  GetAdminJourneysVariables
> {
  const query = useLazyQuery<GetAdminJourneys, GetAdminJourneysVariables>(
    GET_ADMIN_JOURNEYS
  )

  return query
}
