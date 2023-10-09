import { QueryResult, gql, useQuery } from '@apollo/client'

import { ADMIN_JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/adminJourneyFields'

import {
  GetAdminJourney,
  GetAdminJourneyVariables
} from '../../../__generated__/GetAdminJourney'

export const GET_ADMIN_JOURNEY = gql`
  ${ADMIN_JOURNEY_FIELDS}
  query GetAdminJourney($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      ...AdminJourneyFields
    }
  }
`

// For auth required pages in admin app
export function useAdminJourneyQuery(
  variables?: GetAdminJourneyVariables
): QueryResult<GetAdminJourney, GetAdminJourneyVariables> {
  const query = useQuery<GetAdminJourney, GetAdminJourneyVariables>(
    GET_ADMIN_JOURNEY,
    {
      variables
    }
  )

  return query
}
