import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import {
  AiBlockRadioQuestionCreateMutation,
  AiBlockRadioQuestionCreateMutationVariables
} from '../../../../../../__generated__/AiBlockRadioQuestionCreateMutation'

import { blockRadioQuestionCreateInputSchema } from './type'

export const AI_BLOCK_RADIO_QUESTION_CREATE = gql`
  mutation AiBlockRadioQuestionCreateMutation(
    $input: RadioQuestionBlockCreateInput!
  ) {
    radioQuestionBlockCreate(input: $input) {
      id
    }
  }
`

export function blockRadioQuestionCreate(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Create a new radio question block',
    parameters: z.object({
      input: blockRadioQuestionCreateInputSchema
    }),
    execute: async ({ input }) => {
      try {
        const { data } = await client.mutate<
          AiBlockRadioQuestionCreateMutation,
          AiBlockRadioQuestionCreateMutationVariables
        >({
          mutation: AI_BLOCK_RADIO_QUESTION_CREATE,
          variables: { input }
        })
        return data?.radioQuestionBlockCreate
      } catch (error) {
        console.error(error)
        return `Error creating radio question block: ${error}`
      }
    }
  })
}
