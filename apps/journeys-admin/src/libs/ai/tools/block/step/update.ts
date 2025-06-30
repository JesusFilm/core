import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import {
  AiBlockStepUpdateMutation,
  AiBlockStepUpdateMutationVariables
} from '../../../../../../__generated__/AiBlockStepUpdateMutation'

import { blockStepUpdateInputSchema } from './type'

export const AI_BLOCK_STEP_UPDATE = gql`
  mutation AiBlockStepUpdateMutation($id: ID!, $input: StepBlockUpdateInput!) {
    stepBlockUpdate(id: $id, input: $input) {
      id
    }
  }
`

export function blockStepUpdate(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Update a step block.',
    parameters: z.object({
      id: z.string().describe('The id of the step block to update.'),
      input: blockStepUpdateInputSchema
    }),
    execute: async ({ id, input }) => {
      try {
        const { data } = await client.mutate<
          AiBlockStepUpdateMutation,
          AiBlockStepUpdateMutationVariables
        >({
          mutation: AI_BLOCK_STEP_UPDATE,
          variables: { id, input }
        })
        return data?.stepBlockUpdate
      } catch (error) {
        return `Error updating step block: ${error}`
      }
    }
  })
}
