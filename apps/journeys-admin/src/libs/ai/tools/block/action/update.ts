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

export function blockActionUpdate(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Update an action associated with a block.',
    parameters: z.object({
      id: z.string().describe('The id of the block to update the action for.'),
      input: blockActionUpdateInputSchema
    }),
    execute: async ({ id, input }) => {
      const { data } = await client.mutate<
        AiBlockActionUpdateMutation,
        AiBlockActionUpdateMutationVariables
      >({
        mutation: AI_BLOCK_ACTION_UPDATE,
        variables: { id, input }
      })
      return data?.blockUpdateAction
    }
  })
}
