import { generateText } from 'ai'

import { withOpenrouterFallback } from '../openrouterModel'

function parseModelNames(raw: string | undefined): string[] {
  if (raw == null) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export async function getImageDescription({
  imageUrl,
  prompt = 'Analyze this image and provide a brief description focusing on key elements relevant to a journey or story (1-2 sentences)',
  modelNames
}: {
  imageUrl: string
  prompt?: string
  modelNames?: string[]
}): Promise<string | null> {
  const resolvedModels =
    modelNames ?? parseModelNames(process.env.IMAGE_DESCRIPTION_AI_MODELS)
  if (resolvedModels.length === 0) {
    throw new Error(
      'No model names provided and IMAGE_DESCRIPTION_AI_MODELS is not set'
    )
  }

  try {
    const { text } = await withOpenrouterFallback(
      (model) =>
        generateText({
          model,
          maxRetries: 0,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image', image: imageUrl }
              ]
            }
          ]
        }),
      resolvedModels
    )
    return text
  } catch (error) {
    console.error('Error describing image:', error)
    return null
  }
}
