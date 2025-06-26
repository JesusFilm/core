import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import {
  AiBlockTypographyCreateMutation,
  AiBlockTypographyCreateMutationVariables
} from '../../../../../../__generated__/AiBlockTypographyCreateMutation'

import { blockTypographyCreateInputSchema } from './type'

export const AI_BLOCK_TYPOGRAPHY_CREATE = gql`
  mutation AiBlockTypographyCreateMutation(
    $input: TypographyBlockCreateInput!
  ) {
    typographyBlockCreate(input: $input) {
      id
    }
  }
`

export function blockTypographyCreate(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Create a new typography block.',
    parameters: z.object({
      input: blockTypographyCreateInputSchema
    }),
    execute: async ({ input }) => {
      try {
        const { data } = await client.mutate<
          AiBlockTypographyCreateMutation,
          AiBlockTypographyCreateMutationVariables
        >({
          mutation: AI_BLOCK_TYPOGRAPHY_CREATE,
          variables: { input }
        })
        return data?.typographyBlockCreate
      } catch (error) {
        console.error(error)
        return `Error creating typography block: ${error}`
      }
    }
  })
}
