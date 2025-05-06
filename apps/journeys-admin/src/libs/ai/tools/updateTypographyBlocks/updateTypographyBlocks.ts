import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import { TYPOGRAPHY_FIELDS } from '@core/journeys/ui/Typography/typographyFields'

import { typographyBlockUpdateInputSchema } from '../types/block/typography'

const AI_TYPOGRAPHY_UPDATE = gql`
  ${TYPOGRAPHY_FIELDS}
  mutation AITypographyUpdate($id: ID!, $input: TypographyBlockUpdateInput!) {
    typographyBlockUpdate(id: $id, input: $input) {
      ...TypographyFields
      id
    }
  }
`

export function updateTypographyBlocks(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Update an one or many typography blocks.',
    parameters: z.object({
      blocks: z.array(
        z.object({
          id: z.string().describe('The id of the typography block to update.'),
          input: typographyBlockUpdateInputSchema
        })
      )
    }),
    execute: async ({ blocks }) => {
      const results = await Promise.all(
        blocks.map(async ({ id, input }) => {
          const { data } = await client.mutate({
            mutation: AI_TYPOGRAPHY_UPDATE,
            variables: { id, input }
          })
          return data.typographyBlockUpdate
        })
      )
      return results
    }
  })
}
