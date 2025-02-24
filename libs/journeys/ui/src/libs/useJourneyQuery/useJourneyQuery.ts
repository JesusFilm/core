import { QueryResult, gql, useQuery } from '@apollo/client'

import { JOURNEY_FIELDS } from '../JourneyProvider/journeyFields'

import {
  GetJourneyQuery,
  GetJourneyQueryVariables
} from './__generated__/useJourneyQuery'

export const GET_JOURNEY = gql`
  ${JOURNEY_FIELDS}
  query GetJourney($id: ID!, $idType: IdType, $options: JourneysQueryOptions) {
    journey(id: $id, idType: $idType, options: $options) {
      ...JourneyFields
    }
  }
`

export function useJourneyQuery(
  variables?: GetJourneyQueryVariables
): QueryResult<GetJourneyQuery, GetJourneyQueryVariables> {
  const query = useQuery<GetJourneyQuery, GetJourneyQueryVariables>(
    GET_JOURNEY,
    {
      variables
    }
  )

  return query
}
