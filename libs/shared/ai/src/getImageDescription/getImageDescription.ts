import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

export const getImageDescription = async ({
  imageUrl,
  prompt = 'Analyze this image and provide a brief description focusing on key elements relevant to a journey or story (1-2 sentences)'
}: {
  imageUrl: string
  prompt?: string
}): Promise<string | null> => {
  try {
    // Use Gemini to analyze the image via URL directly
    const { text } = await generateText({
      model: google('gemini-2.0-flash'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },

            {
              type: 'image',
              image: imageUrl
            }
          ]
        }
      ]
    })
    return text
  } catch (error) {
    console.error('Error describing image:', error)
    return null
  }
}
