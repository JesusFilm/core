import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { DocumentNode } from 'graphql'
import omit from 'lodash/omit'
import { z } from 'zod'

import { TYPOGRAPHY_FIELDS } from '@core/journeys/ui/Typography/typographyFields'

import { typographyBlockSchema } from '../types/typography'

const UPDATE_TYPOGRAPHY_BLOCK = gql`
  ${TYPOGRAPHY_FIELDS}
  mutation UpdateTypographyBlock(
    $id: ID!
    $input: TypographyBlockUpdateInput!
  ) {
    typographyBlockUpdate(id: $id, input: $input) {
      ...TypographyFields
      id
    }
  }
`

export function updateBlock(client: ApolloClient<NormalizedCacheObject>): Tool {
  return tool({
    description: 'Update a block.',
    parameters: z.object({
      blockId: z.string().describe('The id of the block to update.'),
      block: typographyBlockSchema
    }),
    execute: async ({ blockId, block }) => {
      console.log('block', block)
      function getMutationByBlockType(block: any): DocumentNode {
        console.log('block.__typename', block.__typename)
        switch (block.__typename) {
          case 'TypographyBlock':
            return UPDATE_TYPOGRAPHY_BLOCK

          default:
            throw new Error('Block type not supported')
        }
      }

      try {
        const blockToUpdate = omit(block, ['__typename'])
        const result = await client.mutate({
          mutation: getMutationByBlockType(block),
          variables: { id: blockId, input: { ...blockToUpdate } },
          onError: (error) => {
            console.error('error', error)
          }
        })
        return JSON.stringify(result.data)
      } catch (error) {
        console.error('error', error)
        return error
      }
    }
  })
}
