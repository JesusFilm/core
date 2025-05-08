import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import {
  AiJourneyUpdateMutation,
  AiJourneyUpdateMutationVariables
} from '../../../../../__generated__/AiJourneyUpdateMutation'

import { journeyUpdateInputSchema } from './type'

const AI_JOURNEY_UPDATE = gql`
  mutation AiJourneyUpdateMutation($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      id
    }
  }
`

export function journeyUpdateMany(
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
          const result = await client.mutate<
            AiJourneyUpdateMutation,
            AiJourneyUpdateMutationVariables
          >({
            mutation: AI_JOURNEY_UPDATE,
            variables: { id, input }
          })
          return result.data?.journeyUpdate
        })
      )
      return results
    }
  })
}
