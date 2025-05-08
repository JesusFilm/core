import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import {
  AiBlockTypographyUpdateMutation,
  AiBlockTypographyUpdateMutationVariables
} from '../../../../../../__generated__/AiBlockTypographyUpdateMutation'

import { blockTypographyUpdateInputSchema } from './type'

const AI_BLOCK_TYPOGRAPHY_UPDATE = gql`
  mutation AiBlockTypographyUpdateMutation(
    $id: ID!
    $input: TypographyBlockUpdateInput!
  ) {
    typographyBlockUpdate(id: $id, input: $input) {
      id
    }
  }
`

export function blockTypographyUpdateMany(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Update an one or many typography blocks.',
    parameters: z.object({
      blocks: z.array(
        z.object({
          id: z.string().describe('The id of the typography block to update.'),
          input: blockTypographyUpdateInputSchema
        })
      )
    }),
    execute: async ({ blocks }) => {
      const results = await Promise.all(
        blocks.map(async ({ id, input }) => {
          const { data } = await client.mutate<
            AiBlockTypographyUpdateMutation,
            AiBlockTypographyUpdateMutationVariables
          >({
            mutation: AI_BLOCK_TYPOGRAPHY_UPDATE,
            variables: { id, input }
          })
          return data?.typographyBlockUpdate
        })
      )
      return results
    }
  })
}
