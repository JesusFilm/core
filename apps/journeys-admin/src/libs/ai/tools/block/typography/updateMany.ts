import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import { TYPOGRAPHY_FIELDS } from '@core/journeys/ui/Typography/typographyFields'

import { blockTypographyUpdateInputSchema } from './type'

const AI_BLOCK_TYPOGRAPHY_UPDATE = gql`
  ${TYPOGRAPHY_FIELDS}
  mutation AiBlockTypographyUpdate(
    $id: ID!
    $input: TypographyBlockUpdateInput!
  ) {
    typographyBlockUpdate(id: $id, input: $input) {
      ...TypographyFields
    }
  }
`

export function blockTypographyUpdateMany(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Update an one or many typography blocks.',
    parameters: z.object({
      blocks: z.array(
        z.object({
          id: z.string().describe('The id of the typography block to update.'),
          input: blockTypographyUpdateInputSchema
        })
      )
    }),
    execute: async ({ blocks }) => {
      const results = await Promise.all(
        blocks.map(async ({ id, input }) => {
          const { data } = await client.mutate({
            mutation: AI_BLOCK_TYPOGRAPHY_UPDATE,
            variables: { id, input }
          })
          return data.typographyBlockUpdate
        })
      )
      return results
    }
  })
}
