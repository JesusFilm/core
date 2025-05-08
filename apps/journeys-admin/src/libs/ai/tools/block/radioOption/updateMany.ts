import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import {
  AiBlockRadioOptionMutation,
  AiBlockRadioOptionMutationVariables
} from '../../../../../../__generated__/AiBlockRadioOptionMutation'

import { blockRadioOptionUpdateInputSchema } from './type'

const AI_BLOCK_RADIO_OPTION_UPDATE = gql`
  mutation AiBlockRadioOptionMutation(
    $id: ID!
    $input: RadioOptionBlockUpdateInput!
  ) {
    radioOptionBlockUpdate(id: $id, input: $input) {
      id
    }
  }
`

export function blockRadioOptionUpdateMany(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Update an one or many radio option blocks.',
    parameters: z.object({
      blocks: z.array(
        z.object({
          id: z
            .string()
            .describe('The id of the radio option block to update.'),
          input: blockRadioOptionUpdateInputSchema
        })
      )
    }),
    execute: async ({ blocks }) => {
      const results = await Promise.all(
        blocks.map(async ({ id, input }) => {
          const { data } = await client.mutate<
            AiBlockRadioOptionMutation,
            AiBlockRadioOptionMutationVariables
          >({
            mutation: AI_BLOCK_RADIO_OPTION_UPDATE,
            variables: { id, input }
          })
          return data?.radioOptionBlockUpdate
        })
      )
      return results
    }
  })
}
