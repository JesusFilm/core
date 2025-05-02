import { google } from '@ai-sdk/google'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { generateObject, generateText } from 'ai'
import { Job } from 'bullmq'
import { z } from 'zod'

import { prisma } from '../../../../../lib/prisma'
import { AiTranslateJourneyJob } from '../../service'

import { getCardBlocksContent } from './getCardBlocksContent'
import { getLanguageName } from './getLanguageName'

export async function translateJourney(
  job: Job<AiTranslateJourneyJob>,
  apollo: ApolloClient<NormalizedCacheObject>
): Promise<void> {
  // 1. First get the journey details using Prisma
  const journey = await prisma.journey.findUnique({
    where: {
      id: job.data.outputJourneyId
    },
    include: {
      blocks: true
    }
  })

  if (!journey) {
    throw new Error('Could not fetch journey for translation')
  }

  await job.updateProgress(45)

  // 2. Get the language names
  const sourceLanguageName = await getLanguageName(apollo, journey.languageId)
  const requestedLanguageName = await getLanguageName(
    apollo,
    job.data.textLanguageId
  )

  await job.updateProgress(50)

  // 3. Get Cards Content
  const stepBlocks = journey.blocks
    .filter((block) => block.typename === 'StepBlock')
    .sort((a, b) => (a.parentOrder ?? 0) - (b.parentOrder ?? 0))
  const cardBlocks = stepBlocks
    .map((block) =>
      journey.blocks.find(
        ({ parentBlockId }) =>
          parentBlockId === block.id && block.typename === 'CardBlock'
      )
    )
    .filter((block) => block !== undefined)

  const cardBlocksContent = await getCardBlocksContent({
    blocks: journey.blocks,
    cardBlocks
  })

  // 4. Use Gemini to analyze the journey content and get intent
  const prompt = `
Analyze this journey content and provide the key intent, themes, and target audience. 
Also suggest ways to culturally adapt this content for the target language: ${requestedLanguageName}.
The source language is: ${sourceLanguageName}.
The target language name is: ${requestedLanguageName}.

Journey Title: ${journey.title}
 ${journey.description ? `Journey Description: ${journey.description}` : ''}

Journey Content:
${cardBlocksContent.join('\n')}
`
  const journeyAnalysis = ''
  try {
    const { text: journeyAnalysis } = await generateText({
      model: google('gemini-2.0-flash'),
      prompt
    })

    // Update progress
    await job.updateProgress(70)

    // translate the journey title and description
    try {
      // Translate title and description
      const titleDescPrompt = `
        Translate the following journey title and description to ${requestedLanguageName}.
        If a description is not provided, return a brief 1 sentence description of the journey.
        
        Original title: "${journey.title}"
        Original description: "${journey.description || ''}"
        
        Translation context:
        ${journeyAnalysis}
        
        Return in this format:
        Title: [translated title]
        Description: [translated description]
      `

      const { object: translatedTitleDesc } = await generateObject({
        model: google('gemini-2.0-flash'),
        prompt: titleDescPrompt,
        schema: z.object({
          title: z.string(),
          description: z.string()
        })
      })

      if (translatedTitleDesc.title === null)
        throw new Error('Failed to translate journey title')
      if (translatedTitleDesc.description === null)
        throw new Error('Failed to translate journey description')

      // Update the journey using Prisma
      await prisma.journey.update({
        where: {
          id: job.data.outputJourneyId
        },
        data: {
          title: translatedTitleDesc.title,
          description: translatedTitleDesc.description
        }
      })

      console.log('Successfully translated journey title and description')
    } catch (_error) {
      console.error('Error translating journey title/description')
      // Continue with the rest of the translation
    }

    // 5. Translate each card
    const cardBlocks = journey.blocks.filter(
      (block) => block.typename === 'CardBlock'
    )

    console.log(
      `Analyzing and translating ${cardBlocks.length} card blocks individually`
    )

    for (let i = 0; i < cardBlocks.length; i++) {
      const cardBlock = cardBlocks[i]

      // Get all child blocks of this card
      const cardChildBlocks = journey.blocks.filter(
        (block) => block.parentBlockId === cardBlock.id
      )

      // Extract text blocks in this card
      const cardTypographyBlocks = cardChildBlocks.filter(
        (block) => block.typename === 'TypographyBlock'
      )

      // Extract button blocks in this card
      const cardButtonBlocks = cardChildBlocks.filter(
        (block) => block.typename === 'ButtonBlock'
      )

      const cardContent = cardBlocksContent[i]

      try {
        // Analyze this card in relation to the journey intent
        const cardAnalysisPrompt = `
            I'm going to give you a journey analysis and the content of a specific card in that journey.
            Your task is to analyze how this specific card contributes to the overall journey intent.
            
            Overall journey analysis:
            ${journeyAnalysis}
            
            Card content:
            ${cardContent}
            
            Please analyze:
            1. How does this card relate to the overall journey intent?
            2. What is the specific purpose of this card?
            3. What emotion or action is this card trying to evoke?
            4. Any cultural considerations for translating this card to ${requestedLanguageName}?
            
            Provide a concise analysis that will help inform translation decisions.
          `

        const { text: cardAnalysis } = await generateText({
          model: google('gemini-2.0-flash'),
          prompt: cardAnalysisPrompt
        })

        if (cardAnalysis) {
          console.log(`Successfully analyzed card ${cardBlock.id}`)

          // Now translate all text blocks in this card
          for (const textBlock of cardTypographyBlocks) {
            if (!textBlock.content) continue

            try {
              // Use Gemini to translate the content
              const translationPrompt = `
                  Translate the following text to ${requestedLanguageName}.
                  
                  Original text: "${textBlock.content}"
                  
                  Journey context:
                  ${journeyAnalysis}
                  
                  Specific card context:
                  ${cardAnalysis}
                  
                  Please preserve formatting, emphasis (like bold, italic), and maintain the same tone and style.
                  Return ONLY the translated text without additional notes or explanations.
                `

              const { text: translatedContent } = await generateText({
                model: geminiModel,
                prompt: translationPrompt
              })

              if (translatedContent) {
                // Update the block with translated content using Prisma
                await prisma.block.update({
                  where: {
                    id: textBlock.id
                  },
                  data: {
                    content: translatedContent.trim()
                  }
                })

                console.log(
                  `Successfully translated text block ${textBlock.id} in card ${cardBlock.id}`
                )
              }
            } catch (textTranslationError) {
              console.error(
                `Error translating text block ${textBlock.id} in card ${cardBlock.id}:`,
                textTranslationError
              )
              // Continue with other blocks
            }
          }

          // Translate all button blocks in this card
          for (const buttonBlock of cardButtonBlocks) {
            if (!buttonBlock.label) continue

            try {
              // Use Gemini to translate the button label
              const translationPrompt = `
                  Translate the following button label to ${requestedLanguageName}.
                  
                  Original button label: "${buttonBlock.label}"
                  
                  Journey context:
                  ${journeyAnalysis}
                  
                  Specific card context:
                  ${cardAnalysis}
                  
                  Keep it concise and appropriate for a button. Return ONLY the translated text.
                `

              const { text: translatedLabel } = await generateText({
                model: geminiModel,
                prompt: translationPrompt
              })

              if (translatedLabel) {
                // Update the button block with translated label using Prisma
                await prisma.block.update({
                  where: {
                    id: buttonBlock.id
                  },
                  data: {
                    label: translatedLabel.trim()
                  }
                })

                console.log(
                  `Successfully translated button ${buttonBlock.id} in card ${cardBlock.id}`
                )
              }
            } catch (buttonTranslationError) {
              console.error(
                `Error translating button ${buttonBlock.id} in card ${cardBlock.id}:`,
                buttonTranslationError
              )
              // Continue with other blocks
            }
          }
        }
      } catch (analysisError) {
        console.error(`Error analyzing card ${cardBlock.id}:`, analysisError)
        // Continue with other cards
      }

      // Update progress incrementally
      const progressIncrement = Math.min(15 / cardBlocks.length, 0.5)
      await job.updateProgress(Math.min(100, 70 + (i + 1) * progressIncrement))
    }

    // Update progress
    await job.updateProgress(100)
  } catch (error: unknown) {
    console.error('Error analyzing journey with Gemini:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
    throw new Error(`Failed to analyze journey: ${errorMessage}`)
  }
}
