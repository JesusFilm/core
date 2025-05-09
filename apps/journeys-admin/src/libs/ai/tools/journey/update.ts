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

export function journeyUpdate(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Update a journey.',
    parameters: z.object({
      id: z.string().describe('The id of the journey to update.'),
      input: journeyUpdateInputSchema
    }),
    execute: async ({ id, input }) => {
      const result = await client.mutate<
        AiJourneyUpdateMutation,
        AiJourneyUpdateMutationVariables
      >({
        mutation: AI_JOURNEY_UPDATE,
        variables: { id, input }
      })
      return result.data?.journeyUpdate
    }
  })
}
