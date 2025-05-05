import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { Logger } from 'pino'

import { Block } from '.prisma/api-journeys-modern-client'

import { prisma } from '../../../../../lib/prisma'

export async function translateRadioQuestionBlock({
  block,
  blocks,
  cardAnalysis,
  sourceLanguageName,
  targetLanguageName,
  logger
}: {
  block: Block
  blocks: Block[]
  cardAnalysis: string
  sourceLanguageName: string
  targetLanguageName: string
  logger?: Logger
}): Promise<void> {
  // RadioQuestionBlock itself doesn't have text to translate
  // We need to find and translate its child RadioOptionBlocks

  // Find all radio option blocks that are children of this radio question block
  const radioOptionBlocks = blocks.filter(
    (b) => b.parentBlockId === block.id && b.typename === 'RadioOptionBlock'
  )

  if (radioOptionBlocks.length === 0) {
    logger?.info(`No radio options found for radio question block ${block.id}`)
    return
  }

  logger?.info(
    `Translating ${radioOptionBlocks.length} radio options for radio question block ${block.id}`
  )

  // Translate each radio option block
  for (const optionBlock of radioOptionBlocks) {
    // Skip if label is empty
    if (!optionBlock.label) continue

    try {
      // Use Gemini to translate the radio option label
      const translationPrompt = `
        Translate the following radio option/poll choice from ${sourceLanguageName} to ${targetLanguageName}.
        
        Original option text: "${optionBlock.label}"
        
        Context about this card:
        ${cardAnalysis}
        
        Keep it natural and conversational. Return ONLY the translated text without additional notes or explanations.
      `

      const { text: translatedLabel } = await generateText({
        model: google('gemini-2.0-flash'),
        prompt: translationPrompt
      })

      if (translatedLabel) {
        // Update the radio option block with translated label using Prisma
        await prisma.block.update({
          where: {
            id: optionBlock.id
          },
          data: {
            label: translatedLabel.trim()
          }
        })

        logger?.info(
          `Successfully translated radio option block ${optionBlock.id}`
        )
      }
    } catch (error) {
      logger?.error(
        `Error translating radio option block ${optionBlock.id}:`,
        error
      )
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      logger?.error(`Failed to translate radio option: ${errorMessage}`)
      // Continue with other options
    }
  }
}
