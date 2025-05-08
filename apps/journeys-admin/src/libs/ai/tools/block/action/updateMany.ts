import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import {
  AiBlockActionUpdateMutation,
  AiBlockActionUpdateMutationVariables
} from '../../../../../../__generated__/AiBlockActionUpdateMutation'

import { blockActionUpdateInputSchema } from './type'

const AI_BLOCK_ACTION_UPDATE = gql`
  mutation AiBlockActionUpdateMutation(
    $id: ID!
    $input: BlockUpdateActionInput!
  ) {
    blockUpdateAction(id: $id, input: $input) {
      parentBlockId
    }
  }
`

export function blockActionUpdateMany(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Update an array of actions associated with blocks.',
    parameters: z.object({
      blocks: z.array(
        z.object({
          id: z
            .string()
            .describe('The id of the block to update the action for.'),
          input: blockActionUpdateInputSchema
        })
      )
    }),
    execute: async ({ blocks }) => {
      const results = await Promise.all(
        blocks.map(async ({ id, input }) => {
          const { data } = await client.mutate<
            AiBlockActionUpdateMutation,
            AiBlockActionUpdateMutationVariables
          >({
            mutation: AI_BLOCK_ACTION_UPDATE,
            variables: { id, input }
          })
          return data?.blockUpdateAction
        })
      )
      return results
    }
  })
}
