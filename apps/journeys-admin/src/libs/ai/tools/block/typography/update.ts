import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import {
  AiBlockTypographyUpdateMutation,
  AiBlockTypographyUpdateMutationVariables
} from '../../../../../../__generated__/AiBlockTypographyUpdateMutation'

import { blockTypographyUpdateInputSchema } from './type'

export const AI_BLOCK_TYPOGRAPHY_UPDATE = gql`
  mutation AiBlockTypographyUpdateMutation(
    $id: ID!
    $input: TypographyBlockUpdateInput!
  ) {
    typographyBlockUpdate(id: $id, input: $input) {
      id
    }
  }
`

export function blockTypographyUpdate(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Update a typography block.',
    parameters: z.object({
      id: z.string().describe('The id of the typography block to update.'),
      input: blockTypographyUpdateInputSchema
    }),
    execute: async ({ id, input }) => {
      try {
        const { data } = await client.mutate<
          AiBlockTypographyUpdateMutation,
          AiBlockTypographyUpdateMutationVariables
        >({
          mutation: AI_BLOCK_TYPOGRAPHY_UPDATE,
          variables: { id, input }
        })
        return data?.typographyBlockUpdate
      } catch (error) {
        console.error(error)
        return `Error updating typography block: ${error}`
      }
    }
  })
}
