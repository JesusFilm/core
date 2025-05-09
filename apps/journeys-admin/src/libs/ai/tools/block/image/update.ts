import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import {
  AiBlockImageUpdateMutation,
  AiBlockImageUpdateMutationVariables
} from '../../../../../../__generated__/AiBlockImageUpdateMutation'

import { blockImageUpdateInputSchema } from './type'

export const AI_BLOCK_IMAGE_UPDATE = gql`
  mutation AiBlockImageUpdateMutation(
    $id: ID!
    $input: ImageBlockUpdateInput!
  ) {
    imageBlockUpdate(id: $id, input: $input) {
      id
    }
  }
`

export function blockImageUpdate(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Update an image block.',
    parameters: z.object({
      id: z.string().describe('The id of the image block.'),
      input: blockImageUpdateInputSchema
    }),
    execute: async ({ id, input }) => {
      const { data } = await client.mutate<
        AiBlockImageUpdateMutation,
        AiBlockImageUpdateMutationVariables
      >({
        mutation: AI_BLOCK_IMAGE_UPDATE,
        variables: { id, input }
      })
      return data?.imageBlockUpdate
    }
  })
}
