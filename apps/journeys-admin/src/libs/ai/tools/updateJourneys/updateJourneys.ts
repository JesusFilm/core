import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import { journeyUpdateInputSchema } from '../types/journey'

const AI_UPDATE_JOURNEY = gql`
  mutation AiUpdateJourney($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      id
    }
  }
`

export function updateJourneys(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Update one or more journeys.',
    parameters: z.object({
      journeys: z.array(
        z.object({
          id: z.string(),
          input: journeyUpdateInputSchema
        })
      )
    }),
    execute: async ({ journeys }) => {
      const results = await Promise.all(
        journeys.map(async ({ id, input }) => {
          const result = await client.mutate({
            mutation: AI_UPDATE_JOURNEY,
            variables: { id, input }
          })
          return result.data?.journeyUpdate
        })
      )
      return results
    }
  })
}
