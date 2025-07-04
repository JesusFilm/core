import { openai } from '@ai-sdk/openai'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { experimental_generateImage, tool } from 'ai'
import { z } from 'zod'

import { ToolOptions } from '../..'

import { upload } from './upload'

export function agentGenerateImage(
  client: ApolloClient<NormalizedCacheObject>,
  { langfuseTraceId }: ToolOptions
) {
  return tool({
    description: 'Generate an image',
    parameters: z.object({
      prompt: z.string().describe('The prompt to generate the image from'),
      n: z
        .number()
        .optional()
        .default(1)
        .describe(
          'The number of images to generate. Should be 1 unless you want to provide an array of images for the user to select from.'
        )
    }),
    execute: async ({ prompt, n }) => {
      try {
        const { images } = await experimental_generateImage({
          model: openai.image('dall-e-3'),
          prompt,
          n
        })

        const result = await Promise.all(
          images.map(async (image) => await upload(client, image.uint8Array))
        )

        return result
      } catch (error) {
        return `Error generating image: ${error}`
      }
    }
  })
}
