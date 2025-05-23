import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import {
  AiBlockButtonUpdateMutation,
  AiBlockButtonUpdateMutationVariables
} from '../../../../../../__generated__/AiBlockButtonUpdateMutation'

import { blockButtonUpdateInputSchema } from './type'

const AI_BLOCK_BUTTON_UPDATE = gql`
  mutation AiBlockButtonUpdateMutation(
    $id: ID!
    $input: ButtonBlockUpdateInput!
  ) {
    buttonBlockUpdate(id: $id, input: $input) {
      id
    }
  }
`

export function blockButtonUpdate(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Update a button block.',
    parameters: z.object({
      id: z.string().describe('The id of the button block to update.'),
      input: blockButtonUpdateInputSchema
    }),
    execute: async ({ id, input }) => {
      try {
        const { data } = await client.mutate<
          AiBlockButtonUpdateMutation,
          AiBlockButtonUpdateMutationVariables
        >({
          mutation: AI_BLOCK_BUTTON_UPDATE,
          variables: { id, input }
        })
        return data?.buttonBlockUpdate
      } catch (error) {
        console.error(error)
        return `Error updating button block: ${error}`
      }
    }
  })
}
