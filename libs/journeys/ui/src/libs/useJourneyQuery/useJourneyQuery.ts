import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import { JOURNEY_FIELDS } from '../JourneyProvider/journeyFields'

import { GetJourney, GetJourneyVariables } from './__generated__/GetJourney'

export const GET_JOURNEY = gql`
  ${JOURNEY_FIELDS}
  query GetJourney($id: ID!, $idType: IdType, $options: JourneysQueryOptions) {
    journey(id: $id, idType: $idType, options: $options) {
      ...JourneyFields
    }
  }
`

export function useJourneyQuery(
  variables: GetJourneyVariables
): useQuery.Result<GetJourney, GetJourneyVariables> {
  const query = useQuery<GetJourney, GetJourneyVariables>(GET_JOURNEY, {
    variables
  })

  return query
}
