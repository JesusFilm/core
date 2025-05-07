import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

import { Block } from '.prisma/api-journeys-modern-client'

import { prisma } from '../../../../lib/prisma'

export async function translateTextResponseBlock({
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
  // TextResponseBlock has several fields that may need translation:
  // - label (required)
  // - placeholder (optional)
  // - hint (optional)

  try {
    // 1. First translate the label (required field)
    if (block.label) {
      const labelPrompt = `
        Translate the following text field label from ${sourceLanguageName} to ${targetLanguageName}.
        
        Original label: "${block.label}"
        
        Context about this card:
        ${cardAnalysis}
        
        Keep it concise and natural for a form field label. Return ONLY the translated text without additional notes or explanations.
      `

      const { text: translatedLabel } = await generateText({
        model: google('gemini-2.0-flash'),
        prompt: labelPrompt,
        onStepFinish: ({ usage }) => {
          console.log('usage', usage)
        }
      })

      if (translatedLabel) {
        // Build data object for Prisma update
        const updateData: Record<string, string> = {
          label: translatedLabel.trim()
        }

        // 2. Translate placeholder if it exists
        if (block.placeholder) {
          const placeholderPrompt = `
            Translate the following text field placeholder from ${sourceLanguageName} to ${targetLanguageName}.
            
            Original placeholder: "${block.placeholder}"
            
            Context about this card:
            ${cardAnalysis}
            
            Keep it concise and appropriate for a form field placeholder. Return ONLY the translated text without additional notes or explanations.
          `

          const { text: translatedPlaceholder } = await generateText({
            model: google('gemini-2.0-flash'),
            prompt: placeholderPrompt,
            onStepFinish: ({ usage }) => {
              console.log('usage', usage)
            }
          })

          if (translatedPlaceholder) {
            updateData.placeholder = translatedPlaceholder.trim()
          }
        }

        // 3. Translate hint if it exists
        if (block.hint) {
          const hintPrompt = `
            Translate the following helper text/hint for a form field from ${sourceLanguageName} to ${targetLanguageName}.
            
            Original hint: "${block.hint}"
            
            Context about this card:
            ${cardAnalysis}
            
            Keep it helpful and instructive. Return ONLY the translated text without additional notes or explanations.
          `

          const { text: translatedHint } = await generateText({
            model: google('gemini-2.0-flash'),
            prompt: hintPrompt,
            onStepFinish: ({ usage }) => {
              console.log('usage', usage)
            }
          })

          if (translatedHint) {
            updateData.hint = translatedHint.trim()
          }
        }

        // Update the text response block with all translated fields
        await prisma.block.update({
          where: {
            id: block.id
          },
          data: updateData
        })

        console.log(`Successfully translated text response block ${block.id}`)
      }
    }
  } catch (error) {
    console.error(`Error translating text response block ${block.id}:`, error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
    throw new Error(`Failed to translate text response block: ${errorMessage}`)
  }
}
