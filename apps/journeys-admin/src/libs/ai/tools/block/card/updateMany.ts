import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import {
  AiBlockCardUpdateMutation,
  AiBlockCardUpdateMutationVariables
} from '../../../../../../__generated__/AiBlockCardUpdateMutation'

import { blockCardUpdateInputSchema } from './type'

const AI_BLOCK_CARD_UPDATE = gql`
  mutation AiBlockCardUpdateMutation($id: ID!, $input: CardBlockUpdateInput!) {
    cardBlockUpdate(id: $id, input: $input) {
      id
    }
  }
`

export function blockCardUpdateMany(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Update an array of card blocks.',
    parameters: z.object({
      blocks: z.array(
        z.object({
          id: z.string().describe('The id of the card block to update.'),
          input: blockCardUpdateInputSchema
        })
      )
    }),
    execute: async ({ blocks }) => {
      const results = await Promise.all(
        blocks.map(async ({ id, input }) => {
          const { data } = await client.mutate<
            AiBlockCardUpdateMutation,
            AiBlockCardUpdateMutationVariables
          >({
            mutation: AI_BLOCK_CARD_UPDATE,
            variables: { id, input }
          })
          return data?.cardBlockUpdate
        })
      )
      return results
    }
  })
}
