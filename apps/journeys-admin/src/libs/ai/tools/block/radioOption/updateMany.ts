import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import { RADIO_OPTION_FIELDS } from '@core/journeys/ui/RadioOption/radioOptionFields'

import { blockRadioOptionUpdateInputSchema } from './type'

const AI_BLOCK_RADIO_OPTION_UPDATE = gql`
  ${RADIO_OPTION_FIELDS}
  mutation AiBlockRadioOptionUpdate(
    $id: ID!
    $input: RadioOptionBlockUpdateInput!
  ) {
    radioOptionBlockUpdate(id: $id, input: $input) {
      ...RadioOptionFields
    }
  }
`

export function blockRadioOptionUpdateMany(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Update an one or many radio option blocks.',
    parameters: z.object({
      blocks: z.array(
        z.object({
          id: z
            .string()
            .describe('The id of the radio option block to update.'),
          input: blockRadioOptionUpdateInputSchema
        })
      )
    }),
    execute: async ({ blocks }) => {
      const results = await Promise.all(
        blocks.map(async ({ id, input }) => {
          const { data } = await client.mutate({
            mutation: AI_BLOCK_RADIO_OPTION_UPDATE,
            variables: { id, input }
          })
          return data.radioOptionBlockUpdate
        })
      )
      return results
    }
  })
}
