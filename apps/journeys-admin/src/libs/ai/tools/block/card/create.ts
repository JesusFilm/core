import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import {
  AiBlockCardCreateMutation,
  AiBlockCardCreateMutationVariables
} from '../../../../../../__generated__/AiBlockCardCreateMutation'

import { blockCardCreateInputSchema } from './type'

const AI_BLOCK_CARD_CREATE = gql`
  mutation AiBlockCardCreateMutation($input: CardBlockCreateInput!) {
    cardBlockCreate(input: $input) {
      id
    }
  }
`

export function blockCardCreate(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Create a new card block.',
    parameters: z.object({
      input: blockCardCreateInputSchema
    }),
    execute: async ({ input }) => {
      try {
        const { data } = await client.mutate<
          AiBlockCardCreateMutation,
          AiBlockCardCreateMutationVariables
        >({
          mutation: AI_BLOCK_CARD_CREATE,
          variables: {
            input
          }
        })
        return data
      } catch (error) {
        console.error(error)
        return `Error creating card block: ${error}`
      }
    }
  })
}
