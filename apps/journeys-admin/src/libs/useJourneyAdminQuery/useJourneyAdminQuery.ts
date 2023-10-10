import { QueryResult, gql, useQuery } from '@apollo/client'

import { JOURNEY_ADMIN_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyAdminFields'

import {
  GetJourneyAdmin,
  GetJourneyAdminVariables
} from '../../../__generated__/GetJourneyAdmin'

export const GET_JOURNEY_ADMIN = gql`
  ${JOURNEY_ADMIN_FIELDS}
  query GetJourneyAdmin($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      ...JourneyAdminFields
    }
  }
`

// For auth required pages in admin app
export function useJourneyAdminQuery(
  variables?: GetJourneyAdminVariables
): QueryResult<GetJourneyAdmin, GetJourneyAdminVariables> {
  const query = useQuery<GetJourneyAdmin, GetJourneyAdminVariables>(
    GET_JOURNEY_ADMIN,
    {
      variables
    }
  )

  return query
}
