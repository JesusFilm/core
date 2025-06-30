import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import {
  AiBlockVideoUpdateMutation,
  AiBlockVideoUpdateMutationVariables
} from '../../../../../../__generated__/AiBlockVideoUpdateMutation'

import { blockVideoUpdateInputSchema } from './type'

export const AI_BLOCK_VIDEO_UPDATE = gql`
  mutation AiBlockVideoUpdateMutation(
    $id: ID!
    $input: VideoBlockUpdateInput!
  ) {
    videoBlockUpdate(id: $id, input: $input) {
      id
    }
  }
`

export function blockVideoUpdate(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Update a video block.',
    parameters: z.object({
      id: z.string().describe('The id of the video block.'),
      input: blockVideoUpdateInputSchema
    }),
    execute: async ({ id, input }) => {
      try {
        const { data } = await client.mutate<
          AiBlockVideoUpdateMutation,
          AiBlockVideoUpdateMutationVariables
        >({
          mutation: AI_BLOCK_VIDEO_UPDATE,
          variables: { id, input }
        })
        return data?.videoBlockUpdate
      } catch (error) {
        return `Error updating video block: ${error}`
      }
    }
  })
}
