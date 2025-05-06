import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import { IMAGE_FIELDS } from '@core/journeys/ui/Image/imageFields'

import { imageBlockUpdateInputSchema } from '../types/imageBlock'

export const AI_UPDATE_IMAGE_BLOCK = gql`
  ${IMAGE_FIELDS}
  mutation AiUpdateImageBlock($id: ID!, $input: ImageBlockUpdateInput!) {
    imageBlockUpdate(id: $id, input: $input) {
      id
      parentBlockId
      parentOrder
      ...ImageFields
    }
  }
`

export function updateImageBlock(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Update the image block.',
    parameters: z.object({
      imageBlockId: z.string().describe('The id of the image block.'),
      input: imageBlockUpdateInputSchema
    }),
    execute: async ({ imageBlockId, input }) => {
      const result = await client.mutate({
        mutation: AI_UPDATE_IMAGE_BLOCK,
        variables: { id: imageBlockId, input }
      })
      return result.data?.imageBlockUpdate
    }
  })
}
