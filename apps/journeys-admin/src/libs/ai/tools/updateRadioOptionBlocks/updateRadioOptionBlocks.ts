import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import { RADIO_OPTION_FIELDS } from '@core/journeys/ui/RadioOption/radioOptionFields'

import { radioOptionBlockUpdateInputSchema } from '../types/block/radioOption'

const AI_RADIO_OPTION_UPDATE = gql`
  ${RADIO_OPTION_FIELDS}
  mutation AIRadioOptionUpdate($id: ID!, $input: RadioOptionBlockUpdateInput!) {
    radioOptionBlockUpdate(id: $id, input: $input) {
      ...RadioOptionFields
      id
    }
  }
`

export function updateRadioOptionBlocks(
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
          input: radioOptionBlockUpdateInputSchema
        })
      )
    }),
    execute: async ({ blocks }) => {
      const results = await Promise.all(
        blocks.map(async ({ id, input }) => {
          const { data } = await client.mutate({
            mutation: AI_RADIO_OPTION_UPDATE,
            variables: { id, input }
          })
          return data.radioOptionBlockUpdate
        })
      )
      return results
    }
  })
}
