import { QueryResult, gql, useQuery } from '@apollo/client'

import {
  GetJourney,
  GetJourneyVariables
} from '../../../__generated__/GetJourney'
import { ADMIN_JOURNEY_FIELDS } from '../AdminJourneyProvider/adminJourneyFields'

export const GET_JOURNEY = gql`
  ${ADMIN_JOURNEY_FIELDS}
  query GetJourney($id: ID!) {
    journey(id: $id, idType: databaseId) {
      ...AdminJourneyFields
    }
  }
`
// useJourney in journeys-admin gets journey by databaseId
// For public pages in admin app
export function useJourneyQuery(
  variables?: GetJourneyVariables
): QueryResult<GetJourney, GetJourneyVariables> {
  const query = useQuery<GetJourney, GetJourneyVariables>(GET_JOURNEY, {
    variables
  })

  return query
}
