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

export function blockImageUpdateMany(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Update one or more image blocks.',
    parameters: z.object({
      blocks: z.array(
        z.object({
          id: z.string().describe('The id of the image block.'),
          input: blockImageUpdateInputSchema
        })
      )
    }),
    execute: async ({ blocks }) => {
      const results = await Promise.all(
        blocks.map(async ({ id, input }) => {
          const { data } = await client.mutate({
            mutation: AI_BLOCK_IMAGE_UPDATE,
            variables: { id, input }
          })
          return data.imageBlockUpdate
        })
      )
      return results
    }
  })
}
