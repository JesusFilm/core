import { google } from '@ai-sdk/google'
import { generateImage } from 'ai'

import type { ImageGenerationRequest, ImageGenerationResponse } from './types'

export const generateImageWithGemini = async (
  request: ImageGenerationRequest,
  apiKey?: string
): Promise<ImageGenerationResponse> => {
  const model = google('gemini-2.5-flash-image-preview', apiKey ? { apiKey } : undefined)

  const startTime = Date.now()

  try {
    const result = await generateImage({
      model,
      prompt: request.prompt,
      image: request.image,
      aspectRatio: request.aspectRatio as any, // Cast to match SDK types
      quality: request.quality,
      seed: request.seed
    })

    const generationTime = Date.now() - startTime

    return {
      images: result.images.map(image => ({
        url: image.url,
        width: image.width,
        height: image.height,
        format: image.format || 'png'
      })),
      metadata: {
        model: 'gemini-2.5-flash-image-preview',
        prompt: request.prompt,
        generationTime
      }
    }
  } catch (error) {
    console.error('Error generating image with Gemini:', error)
    throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

