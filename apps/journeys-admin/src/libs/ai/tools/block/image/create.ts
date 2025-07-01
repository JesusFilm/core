import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import {
  AiBlockImageCreateMutation,
  AiBlockImageCreateMutationVariables
} from '../../../../../../__generated__/AiBlockImageCreateMutation'

import { blockImageCreateInputSchema } from './type'

export const AI_BLOCK_IMAGE_CREATE = gql`
  mutation AiBlockImageCreateMutation($input: ImageBlockCreateInput!) {
    imageBlockCreate(input: $input) {
      id
    }
  }
`

export function blockImageCreate(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Create a new image block.',
    parameters: z.object({
      input: blockImageCreateInputSchema
    }),
    execute: async ({ input }) => {
      try {
        const safeInput = { ...input, alt: input.alt ?? '' }
        const { data } = await client.mutate<
          AiBlockImageCreateMutation,
          AiBlockImageCreateMutationVariables
        >({
          mutation: AI_BLOCK_IMAGE_CREATE,
          variables: { input: safeInput }
        })
        return data?.imageBlockCreate
      } catch (error) {
        return `Error creating image block: ${error}`
      }
    }
  })
}
