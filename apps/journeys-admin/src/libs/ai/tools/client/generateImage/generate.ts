import { openai } from '@ai-sdk/openai'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { experimental_generateImage, tool } from 'ai'
import { z } from 'zod'

import { uploadGeneratedImage } from './uploadGeneratedImage'

export function generateImage(client: ApolloClient<NormalizedCacheObject>) {
  return tool({
    description: 'Generate an image',
    parameters: z.object({
      prompt: z.string().describe('The prompt to generate the image from')
    }),
    execute: async ({ prompt }) => {
      const { image } = await experimental_generateImage({
        model: openai.image('dall-e-3'),
        prompt
      })

      const { src, success } = await uploadGeneratedImage(
        client,
        image.base64,
        `ai-generated-${Date.now()}.png`
      )

      return {
        prompt,
        imageSrc: src,
        uploadSuccess: success
      }
    }
  })
}
