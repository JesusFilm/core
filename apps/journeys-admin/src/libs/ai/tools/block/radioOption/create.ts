import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import {
  RadioOptionBlockCreate,
  RadioOptionBlockCreateVariables
} from '../../../../../../__generated__/RadioOptionBlockCreate'

import { blockRadioOptionCreateInputSchema } from './type'

const AI_BLOCK_RADIO_OPTION_CREATE = gql`
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
          RadioOptionBlockCreate,
          RadioOptionBlockCreateVariables
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
