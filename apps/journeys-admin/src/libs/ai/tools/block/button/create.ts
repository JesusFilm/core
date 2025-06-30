import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import {
  AiBlockButtonCreateMutation,
  AiBlockButtonCreateMutationVariables
} from '../../../../../../__generated__/AiBlockButtonCreateMutation'

import { blockButtonCreateInputSchema } from './type'

export const AI_BLOCK_BUTTON_CREATE = gql`
  mutation AiBlockButtonCreateMutation($input: ButtonBlockCreateInput!) {
    buttonBlockCreate(input: $input) {
      id
    }
  }
`

export function blockButtonCreate(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Create a new button block.',
    parameters: z.object({
      input: blockButtonCreateInputSchema
    }),
    execute: async ({ input }) => {
      try {
        const { data } = await client.mutate<
          AiBlockButtonCreateMutation,
          AiBlockButtonCreateMutationVariables
        >({
          mutation: AI_BLOCK_BUTTON_CREATE,
          variables: { input }
        })
        return data?.buttonBlockCreate
      } catch (error) {
        return `Error creating button block: ${error}`
      }
    }
  })
}
