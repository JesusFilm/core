import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import { TYPOGRAPHY_FIELDS } from '@core/journeys/ui/Typography/typographyFields'

import { typographyBlockUpdateInputSchema } from '../types/typography'

const AI_TYPOGRAPHY_UPDATE = gql`
  ${TYPOGRAPHY_FIELDS}
  mutation AITypographyUpdate($id: ID!, $input: TypographyBlockUpdateInput!) {
    typographyBlockUpdate(id: $id, input: $input) {
      ...TypographyFields
      id
    }
  }
`

export function updateTypographyBlock(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Update a typography block.',
    parameters: z.object({
      blockId: z.string().describe('The id of the typography block to update.'),
      input: typographyBlockUpdateInputSchema
    }),
    execute: async ({ blockId, input }) => {
      const { data } = await client.mutate({
        mutation: AI_TYPOGRAPHY_UPDATE,
        variables: { id: blockId, input }
      })
      return data.typographyBlockUpdate
    }
  })
}
