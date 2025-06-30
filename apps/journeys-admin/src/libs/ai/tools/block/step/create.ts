import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import {
  AiBlockStepCreateMutation,
  AiBlockStepCreateMutationVariables
} from '../../../../../../__generated__/AiBlockStepCreateMutation'
import { blockCardCreateInputSchema } from '../card/type'

import { blockStepCreateInputSchema } from './type'

export const AI_BLOCK_STEP_CREATE = gql`
  mutation AiBlockStepCreateMutation(
    $input: StepBlockCreateInput!
    $cardInput: CardBlockCreateInput!
  ) {
    stepBlockCreate(input: $input) {
      id
    }
    cardBlockCreate(input: $cardInput) {
      id
    }
  }
`

export function blockStepCreate(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description:
      'Create a new step block with a single card block as its content.',
    parameters: z.object({
      input: blockStepCreateInputSchema,
      cardInput: blockCardCreateInputSchema
    }),
    execute: async ({ input, cardInput }) => {
      try {
        const { data } = await client.mutate<
          AiBlockStepCreateMutation,
          AiBlockStepCreateMutationVariables
        >({
          mutation: AI_BLOCK_STEP_CREATE,
          variables: { input, cardInput }
        })
        return data?.stepBlockCreate
      } catch (error) {
        return `Error creating step block: ${error}`
      }
    }
  })
}
