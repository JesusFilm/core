import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import { VIDEO_FIELDS } from '@core/journeys/ui/Video/videoFields'

import { videoBlockUpdateInputSchema } from '../types/videoBlock'

export const AI_UPDATE_VIDEO_BLOCK = gql`
  ${VIDEO_FIELDS}
  mutation AiUpdateVideoBlock($id: ID!, $input: VideoBlockUpdateInput!) {
    videoBlockUpdate(id: $id, input: $input) {
      id
      ...VideoFields
    }
  }
`

export function updateVideoBlocks(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Update one or more video blocks.',
    parameters: z.object({
      blocks: z.array(
        z.object({
          id: z.string().describe('The id of the video block.'),
          input: videoBlockUpdateInputSchema
        })
      )
    }),
    execute: async ({ blocks }) => {
      const results = await Promise.all(
        blocks.map(async ({ id, input }) => {
          const { data } = await client.mutate({
            mutation: AI_UPDATE_VIDEO_BLOCK,
            variables: { id, input }
          })
          return data.videoBlockUpdate
        })
      )
      return results
    }
  })
}
