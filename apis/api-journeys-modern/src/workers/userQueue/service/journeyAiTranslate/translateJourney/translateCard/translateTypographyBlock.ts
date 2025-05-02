import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

import { Block } from '.prisma/api-journeys-modern-client'

import { prisma } from '../../../../../../lib/prisma'

export async function translateTypographyBlock({
  block,
  cardAnalysis,
  sourceLanguageName,
  targetLanguageName
}: {
  block: Block
  cardAnalysis: string
  sourceLanguageName: string
  targetLanguageName: string
}): Promise<void> {
  // Skip if content is empty
  if (!block.content) return

  try {
    // Use Gemini to translate the typography content
    const translationPrompt = `
      Translate the following button text from ${sourceLanguageName} to ${targetLanguageName}.
      
      Original text: "${block.content}"
      
      Context about this card:
      ${cardAnalysis}
      
      Return ONLY the translated text without additional notes or explanations.
    `

    const { text: translatedContent } = await generateText({
      model: google('gemini-2.0-flash'),
      prompt: translationPrompt
    })

    if (translatedContent) {
      // Update the block with translated content using Prisma
      await prisma.block.update({
        where: {
          id: block.id
        },
        data: {
          content: translatedContent.trim()
        }
      })

      console.log(`Successfully translated typography block ${block.id}`)
    }
  } catch (error) {
    console.error(`Error translating typography block ${block.id}:`, error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
    throw new Error(`Failed to translate typography block: ${errorMessage}`)
  }
}
