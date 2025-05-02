import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

import { Block } from '.prisma/api-journeys-modern-client'

import { prisma } from '../../../../../../lib/prisma'

export async function translateButtonBlock({
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
  // Skip if label is empty
  if (!block.label) return

  try {
    // Use Gemini to translate the button label
    const translationPrompt = `
      Translate the following button text from ${sourceLanguageName} to ${targetLanguageName}.
      
      Original button label: "${block.label}"
      
      Context about this card:
      ${cardAnalysis}
      
      Keep it concise and appropriate for a button. Return ONLY the translated text without additional notes or explanations.
    `

    const { text: translatedLabel } = await generateText({
      model: google('gemini-2.0-flash'),
      prompt: translationPrompt
    })

    if (translatedLabel) {
      // Update the button block with translated label using Prisma
      await prisma.block.update({
        where: {
          id: block.id
        },
        data: {
          label: translatedLabel.trim()
        }
      })

      console.log(`Successfully translated button block ${block.id}`)
    }
  } catch (error) {
    console.error(`Error translating button block ${block.id}:`, error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
    throw new Error(`Failed to translate button block: ${errorMessage}`)
  }
}
