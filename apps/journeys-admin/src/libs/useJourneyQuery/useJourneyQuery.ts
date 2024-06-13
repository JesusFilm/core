import { QueryResult, gql, useQuery } from '@apollo/client'

import { JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyFields'

import {
  GetJourney,
  GetJourneyVariables
} from '../../../__generated__/GetJourney'

export const GET_JOURNEY = gql`
  ${JOURNEY_FIELDS}
  query GetJourney($id: ID!) {
    journey(id: $id, idType: databaseId) {
      ...JourneyFields
    }
  }
`
// useJourney in journeys-admin gets journey by databaseId
export function useJourneyQuery(
  variables?: GetJourneyVariables
): QueryResult<GetJourney, GetJourneyVariables> {
  const query = useQuery<GetJourney, GetJourneyVariables>(GET_JOURNEY, {
    variables
  })

  return query
}
