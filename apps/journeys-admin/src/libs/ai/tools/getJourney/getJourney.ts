import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import { JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyFields'

const GET_ADMIN_JOURNEY = gql`
  ${JOURNEY_FIELDS}
  query GetAdminJourney($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      id
      ...JourneyFields
    }
  }
`

export function getJourney(client: ApolloClient<NormalizedCacheObject>): Tool {
  return tool({
    description: 'Get the journey.',
    parameters: z.object({
      journeyId: z.string().describe('The id of the journey.')
    }),
    execute: async ({ journeyId }) => {
      try {
        const result = await client.query({
          query: GET_ADMIN_JOURNEY,
          variables: { id: journeyId }
        })
        return result.data?.journey
      } catch (error) {
        return error
      }
    }
  })
}
