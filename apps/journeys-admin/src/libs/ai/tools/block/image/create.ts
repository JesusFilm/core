import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import {
  ImageBlockCreate,
  ImageBlockCreateVariables
} from '../../../../../../__generated__/ImageBlockCreate'

import { blockImageUpdateInputSchema } from './type'

const AI_BLOCK_IMAGE_CREATE = gql`
  mutation AiBlockImageCreateMutation($input: ImageBlockCreateInput!) {
    imageBlockCreate(input: $input) {
      id
    }
  }
`

const blockImageCreateInputSchema = blockImageUpdateInputSchema.merge(
  z.object({ journeyId: z.string(), alt: z.string().default('') })
)

export function blockImageCreate(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Create a new image block.',
    parameters: z.object({
      input: blockImageCreateInputSchema
    }),
    execute: async ({ input }) => {
      try {
        const safeInput = { ...input, alt: input.alt ?? '' }
        const { data } = await client.mutate<
          ImageBlockCreate,
          ImageBlockCreateVariables
        >({
          mutation: AI_BLOCK_IMAGE_CREATE,
          variables: { input: safeInput }
        })
        return data?.imageBlockCreate
      } catch (error) {
        console.error(error)
        return `Error creating image block: ${error}`
      }
    }
  })
}
