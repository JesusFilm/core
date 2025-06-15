import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import {
  AiBlockRadioOptionCreateMutation,
  AiBlockRadioOptionCreateMutationVariables
} from '../../../../../../__generated__/AiBlockRadioOptionCreateMutation'

import { blockRadioOptionCreateInputSchema } from './type'

export const AI_BLOCK_RADIO_OPTION_CREATE = gql`
  mutation AiBlockRadioOptionCreateMutation(
    $input: RadioOptionBlockCreateInput!
  ) {
    radioOptionBlockCreate(input: $input) {
      id
    }
  }
`

export function blockRadioOptionCreate(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Create a new radio option block.',
    parameters: z.object({
      input: blockRadioOptionCreateInputSchema
    }),
    execute: async ({ input }) => {
      try {
        const { data } = await client.mutate<
          AiBlockRadioOptionCreateMutation,
          AiBlockRadioOptionCreateMutationVariables
        >({
          mutation: AI_BLOCK_RADIO_OPTION_CREATE,
          variables: { input }
        })
        return data?.radioOptionBlockCreate
      } catch (error) {
        console.error(error)
        return `Error creating radio option block: ${error}`
      }
    }
  })
}
