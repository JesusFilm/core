import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import {
  AiBlockDeleteMutation,
  AiBlockDeleteMutationVariables
} from '../../../../../__generated__/AiBlockDeleteMutation'

const AI_BLOCK_DELETE = gql`
  mutation AiBlockDeleteMutation($id: ID!) {
    blockDelete(id: $id) {
      id
      parentOrder
      ... on StepBlock {
        nextBlockId
      }
    }
  }
`

export function blockDelete(client: ApolloClient<NormalizedCacheObject>): Tool {
  return tool({
    description: 'Delete a block by its ID.',
    parameters: z.object({
      id: z.string().describe('The ID of the block to delete')
    }),
    execute: async ({ id }) => {
      try {
        const { data } = await client.mutate<
          AiBlockDeleteMutation,
          AiBlockDeleteMutationVariables
        >({
          mutation: AI_BLOCK_DELETE,
          variables: { id }
        })
        return data?.blockDelete
      } catch (error) {
        console.error(error)
        return `Error deleting block: ${error}`
      }
    }
  })
}
