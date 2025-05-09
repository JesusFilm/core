import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import {
  AiBlockStepCreateMutation,
  AiBlockStepCreateMutationVariables
} from '../../../../../../__generated__/AiBlockStepCreateMutation'

import { blockStepCreateInputSchema } from './type'

const AI_BLOCK_STEP_CREATE = gql`
  mutation AiBlockStepCreateMutation($input: StepBlockCreateInput!) {
    stepBlockCreate(input: $input) {
      id
    }
  }
`

export function blockStepCreate(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Create a new step block.',
    parameters: z.object({
      input: blockStepCreateInputSchema
    }),
    execute: async ({ input }) => {
      try {
        const { data } = await client.mutate<
          AiBlockStepCreateMutation,
          AiBlockStepCreateMutationVariables
        >({
          mutation: AI_BLOCK_STEP_CREATE,
          variables: { input }
        })
        return data?.stepBlockCreate
      } catch (error) {
        console.error(error)
        return `Error creating step block: ${error}`
      }
    }
  })
}
