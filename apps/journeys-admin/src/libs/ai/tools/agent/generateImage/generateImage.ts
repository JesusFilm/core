import { createVertex } from '@ai-sdk/google-vertex/edge'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { experimental_generateImage as generateImage, tool } from 'ai'
import { z } from 'zod'

import { ToolOptions } from '../..'

import { upload } from './upload'

const vertex = createVertex({
  project: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  googleCredentials: {
    clientEmail: process.env.PRIVATE_FIREBASE_CLIENT_EMAIL!,
    privateKey: process.env.PRIVATE_FIREBASE_PRIVATE_KEY!
  }
})

export function agentGenerateImage(
  client: ApolloClient<NormalizedCacheObject>,
  _options: ToolOptions
) {
  return tool({
    description:
      'Generate an image or collection of images. It returns an array of images URLs',
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
        const { images } = await generateImage({
          model: vertex.image('imagen-3.0-fast-generate-001'),
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
