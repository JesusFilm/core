import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import { BUTTON_FIELDS } from '@core/journeys/ui/Button/buttonFields'

import { buttonBlockUpdateInputSchema } from '../types/block/button'

const AI_BUTTON_UPDATE = gql`
  ${BUTTON_FIELDS}
  mutation AIButtonUpdate($id: ID!, $input: ButtonBlockUpdateInput!) {
    buttonBlockUpdate(id: $id, input: $input) {
      ...ButtonFields
      id
    }
  }
`

export function updateButtonBlocks(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Update an array of button blocks.',
    parameters: z.object({
      blocks: z.array(
        z.object({
          id: z.string().describe('The id of the button block to update.'),
          input: buttonBlockUpdateInputSchema
        })
      )
    }),
    execute: async ({ blocks }) => {
      const results = await Promise.all(
        blocks.map(async ({ id, input }) => {
          const { data } = await client.mutate({
            mutation: AI_BUTTON_UPDATE,
            variables: { id, input }
          })
          return data.buttonBlockUpdate
        })
      )
      return results
    }
  })
}
