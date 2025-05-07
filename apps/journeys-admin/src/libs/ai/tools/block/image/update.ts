import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import { IMAGE_FIELDS } from '@core/journeys/ui/Image/imageFields'

import { blockImageUpdateInputSchema } from './type'

export const AI_BLOCK_IMAGE_UPDATE = gql`
  ${IMAGE_FIELDS}
  mutation AiBlockImageUpdate($id: ID!, $input: ImageBlockUpdateInput!) {
    imageBlockUpdate(id: $id, input: $input) {
      ...ImageFields
    }
  }
`

export function blockImageUpdate(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Update the image block.',
    parameters: z.object({
      imageBlockId: z.string().describe('The id of the image block.'),
      input: blockImageUpdateInputSchema
    }),
    execute: async ({ imageBlockId, input }) => {
      const result = await client.mutate({
        mutation: AI_BLOCK_IMAGE_UPDATE,
        variables: { id: imageBlockId, input }
      })
      return result.data?.imageBlockUpdate
    }
  })
}
