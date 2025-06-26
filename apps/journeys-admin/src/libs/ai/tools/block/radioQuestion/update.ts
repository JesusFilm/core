import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import {
  AiBlockRadioQuestionUpdateMutation,
  AiBlockRadioQuestionUpdateMutationVariables
} from '../../../../../../__generated__/AiBlockRadioQuestionUpdateMutation'

export const AI_BLOCK_RADIO_QUESTION_UPDATE = gql`
  mutation AiBlockRadioQuestionUpdateMutation($id: ID!, $parentBlockId: ID!) {
    radioQuestionBlockUpdate(id: $id, parentBlockId: $parentBlockId) {
      id
    }
  }
`

export function blockRadioQuestionUpdate(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Update a radio question block.',
    parameters: z.object({
      id: z.string().describe('The id of the radio question block to update.'),
      parentBlockId: z.string().describe('The id of the parent block')
    }),
    execute: async ({ id, parentBlockId }) => {
      try {
        const { data } = await client.mutate<
          AiBlockRadioQuestionUpdateMutation,
          AiBlockRadioQuestionUpdateMutationVariables
        >({
          mutation: AI_BLOCK_RADIO_QUESTION_UPDATE,
          variables: { id, parentBlockId }
        })
        return data?.radioQuestionBlockUpdate
      } catch (error) {
        console.error(error)
        return `Error updating radio question block: ${error}`
      }
    }
  })
}
