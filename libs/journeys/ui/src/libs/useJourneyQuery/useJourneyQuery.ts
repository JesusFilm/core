import { QueryResult, useQuery } from '@apollo/client'

import { ResultOf, VariablesOf, graphql } from '@core/shared/gql'

import { JOURNEY_FIELDS } from '../JourneyProvider/journeyFields'

export type GetJourney = ResultOf<typeof GET_JOURNEY>
export type GetJourneyVariables = VariablesOf<typeof GET_JOURNEY>

export const GET_JOURNEY = graphql(
  `
    query GetJourney(
      $id: ID!
      $idType: IdType
      $options: JourneysQueryOptions
    ) {
      journey(id: $id, idType: $idType, options: $options) {
        ...JourneyFields
      }
    }
  `,
  [JOURNEY_FIELDS]
)

export function useJourneyQuery(
  variables?: GetJourneyVariables
): QueryResult<GetJourney, GetJourneyVariables> {
  const query = useQuery<GetJourney, GetJourneyVariables>(GET_JOURNEY, {
    variables
  })

  return query
}
