import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import {
  VideoBlockCreate,
  VideoBlockCreateVariables
} from '../../../../../../__generated__/VideoBlockCreate'

import { blockVideoUpdateInputSchema } from './type'

const AI_BLOCK_VIDEO_CREATE = gql`
  mutation AiBlockVideoCreateMutation($input: VideoBlockCreateInput!) {
    videoBlockCreate(input: $input) {
      id
    }
  }
`

const blockVideoCreateInputSchema = blockVideoUpdateInputSchema.merge(
  z.object({ journeyId: z.string(), parentBlockId: z.string() })
)

export function blockVideoCreate(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Create a new video block.',
    parameters: z.object({
      input: blockVideoCreateInputSchema
    }),
    execute: async ({ input }) => {
      try {
        const { data } = await client.mutate<
          VideoBlockCreate,
          VideoBlockCreateVariables
        >({
          mutation: AI_BLOCK_VIDEO_CREATE,
          variables: { input }
        })
        return data?.videoBlockCreate
      } catch (error) {
        console.error(error)
        return `Error creating video block: ${error}`
      }
    }
  })
}
