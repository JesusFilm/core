import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import {
  AiBlockRadioOptionMutation,
  AiBlockRadioOptionMutationVariables
} from '../../../../../../__generated__/AiBlockRadioOptionMutation'

import { blockRadioOptionUpdateInputSchema } from './type'

export const AI_BLOCK_RADIO_OPTION_UPDATE = gql`
  mutation AiBlockRadioOptionMutation(
    $id: ID!
    $input: RadioOptionBlockUpdateInput!
  ) {
    radioOptionBlockUpdate(id: $id, input: $input) {
      id
    }
  }
`

export function blockRadioOptionUpdate(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Update a radio option block.',
    parameters: z.object({
      id: z.string().describe('The id of the radio option block to update.'),
      input: blockRadioOptionUpdateInputSchema
    }),
    execute: async ({ id, input }) => {
      try {
        const { data } = await client.mutate<
          AiBlockRadioOptionMutation,
          AiBlockRadioOptionMutationVariables
        >({
          mutation: AI_BLOCK_RADIO_OPTION_UPDATE,
          variables: { id, input }
        })
        return data?.radioOptionBlockUpdate
      } catch (error) {
        return `Error updating radio option block: ${error}`
      }
    }
  })
}
