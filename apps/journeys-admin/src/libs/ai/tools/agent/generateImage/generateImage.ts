import { createVertex } from '@ai-sdk/google-vertex/edge'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { experimental_generateImage as generateImage, tool } from 'ai'
import { encode } from 'blurhash'
import sharp from 'sharp'
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
        ),
      aspectRatio: z
        .string()
        .optional()
        .default('9:16')
        .describe(
          'The aspect ratio of the image. Should be in the format "width:height" in lowest common denominator format. If generating a background image, use 9:16.'
        )
    }),
    execute: async ({ prompt, n, aspectRatio }) => {
      try {
        const { images } = await generateImage({
          model: vertex.image('imagen-3.0-fast-generate-001'),
          prompt: `Do not put any text on the image.\n${prompt}`,
          n,
          aspectRatio: aspectRatio as `${number}:${number}`
        })

        const result = await Promise.all(
          images.map(async (image) => {
            const sharpImage = sharp(image.uint8Array)
            const metadata = await sharpImage.metadata()
            const { width, height, format } = metadata
            if (width == null || height == null || !format)
              throw new Error('Invalid image dimensions or format')

            let outputBuffer: Buffer
            switch (format) {
              case 'jpeg':
                outputBuffer = await sharpImage.jpeg().toBuffer()
                break
              case 'png':
                outputBuffer = await sharpImage.png().toBuffer()
                break
              case 'webp':
                outputBuffer = await sharpImage.webp().toBuffer()
                break
              default:
                // fallback to PNG if format is unknown
                outputBuffer = await sharpImage.png().toBuffer()
                break
            }

            const imageResponse = await upload(
              client,
              new Uint8Array(outputBuffer)
            )
            if (imageResponse.success) {
              const rawBuffer = await sharpImage.raw().ensureAlpha().toBuffer()
              return {
                url: imageResponse.src,
                width,
                height,
                blurHash: encode(
                  new Uint8ClampedArray(rawBuffer),
                  width,
                  height,
                  4,
                  4
                )
              }
            }
            return null
          })
        )

        return result.filter((image) => image != null)
      } catch (error) {
        return `Error generating image: ${error}`
      }
    }
  })
}
