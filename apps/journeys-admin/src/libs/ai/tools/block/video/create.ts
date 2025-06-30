import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import {
  AiBlockVideoCreateMutation,
  AiBlockVideoCreateMutationVariables
} from '../../../../../../__generated__/AiBlockVideoCreateMutation'
import { VideoBlockCreateInput } from '../../../../../../__generated__/globalTypes'

import { blockVideoUpdateInputSchema } from './type'

export const AI_BLOCK_VIDEO_CREATE = gql`
  mutation AiBlockVideoCreateMutation($input: VideoBlockCreateInput!) {
    videoBlockCreate(input: $input) {
      id
    }
  }
`

export const blockVideoCreateInputSchema = blockVideoUpdateInputSchema.merge(
  z.object({ journeyId: z.string(), parentBlockId: z.string() })
) satisfies z.ZodType<VideoBlockCreateInput>

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
          AiBlockVideoCreateMutation,
          AiBlockVideoCreateMutationVariables
        >({
          mutation: AI_BLOCK_VIDEO_CREATE,
          variables: { input }
        })
        return data?.videoBlockCreate
      } catch (error) {
        return `Error creating video block: ${error}`
      }
    }
  })
}
