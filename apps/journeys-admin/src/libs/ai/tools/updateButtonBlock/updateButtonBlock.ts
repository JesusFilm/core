import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import { BUTTON_FIELDS } from '@core/journeys/ui/Button/buttonFields'

import { buttonBlockUpdateInputSchema } from '../types/button'

const AI_BUTTON_UPDATE = gql`
  ${BUTTON_FIELDS}
  mutation AIButtonUpdate($id: ID!, $input: ButtonBlockUpdateInput!) {
    buttonBlockUpdate(id: $id, input: $input) {
      ...ButtonFields
      id
    }
  }
`

export function updateButtonBlock(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Update a button block.',
    parameters: z.object({
      blockId: z.string().describe('The id of the button block to update.'),
      input: buttonBlockUpdateInputSchema
    }),
    execute: async ({ blockId, input }) => {
      const { data } = await client.mutate({
        mutation: AI_BUTTON_UPDATE,
        variables: { id: blockId, input }
      })
      return data.buttonBlockUpdate
    }
  })
}
