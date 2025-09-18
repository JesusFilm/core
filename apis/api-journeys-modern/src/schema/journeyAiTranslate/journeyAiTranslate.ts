import { google } from '@ai-sdk/google'
import { generateObject, streamObject } from 'ai'
import { GraphQLError } from 'graphql'
import { z } from 'zod'

import { prisma } from '@core/prisma/journeys/client'
import { hardenPrompt, preSystemPrompt } from '@core/shared/ai/prompts'

import { Action, ability, subject } from '../../lib/auth/ability'
import { builder } from '../builder'
import { JourneyRef } from '../journey/journey'

import { getCardBlocksContent } from './getCardBlocksContent'

// Define the translation progress interface
interface JourneyAiTranslateProgress {
  progress: number
  message: string
  journey: typeof JourneyRef.$inferType | null
}

// Define the translation progress type
const JourneyAiTranslateProgressRef =
  builder.objectRef<JourneyAiTranslateProgress>('JourneyAiTranslateProgress')

builder.objectType(JourneyAiTranslateProgressRef, {
  fields: (t) => ({
    progress: t.float({
      description: 'Translation progress as a percentage (0-100)',
      resolve: (parent) => parent.progress
    }),
    message: t.string({
      description: 'Current translation step message',
      resolve: (parent) => parent.message
    }),
    journey: t.prismaField({
      type: 'Journey',
      nullable: true,
      description: 'The journey being translated (only present when complete)',
      resolve: (query, parent) => {
        // Return the journey if it exists, otherwise null
        return parent.journey ? { ...query, ...parent.journey } : null
      }
    })
  })
})

// Define Zod schemas for AI responses
const JourneyAnalysisSchema = z.object({
  analysis: z
    .string()
    .describe('Analysis of the journey content and cultural considerations'),
  title: z.string().describe('Translated journey title'),
  description: z.string().describe('Translated journey description'),
  seoTitle: z.string().describe('Translated journey SEO title'),
  seoDescription: z.string().describe('Translated journey SEO description')
})

// Define the shared input type
const JourneyAiTranslateInput = builder.inputType('JourneyAiTranslateInput', {
  fields: (t) => ({
    journeyId: t.id({ required: true }),
    name: t.string({ required: true }),
    journeyLanguageName: t.string({ required: true }),
    textLanguageId: t.id({ required: true }),
    textLanguageName: t.string({ required: true })
  })
})

builder.subscriptionField('journeyAiTranslateCreateSubscription', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: JourneyAiTranslateProgressRef,
    nullable: false,
    args: {
      input: t.arg({
        type: JourneyAiTranslateInput,
        required: true
      })
    },
    subscribe: async function* (_root, { input }, context) {
      // Create async iterable for real AI translation
      try {
        // Initial progress
        yield {
          progress: 0,
          message: 'Starting translation...',
          journey: null
        }

        // Validate journey exists and user has permission
        const journey = await prisma.journey.findUnique({
          where: { id: input.journeyId },
          include: {
            blocks: true,
            userJourneys: true,
            team: {
              include: {
                userTeams: true
              }
            }
          }
        })

        if (journey == null) {
          throw new GraphQLError('journey not found')
        }

        // Check permissions
        const hasPermission = ability(
          Action.Update,
          subject('Journey', journey),
          context.user
        )

        if (!hasPermission) {
          throw new GraphQLError(
            'user does not have permission to update journey'
          )
        }

        yield {
          progress: 10,
          message: 'Validating journey permissions...',
          journey: null
        }

        // Get card blocks and their content
        const cardBlocks = journey.blocks.filter(
          (block) => block.typename === 'CardBlock'
        )

        yield {
          progress: 20,
          message: 'Analyzing journey content...',
          journey: null
        }

        // Get content for AI analysis
        const cardBlocksContent = await getCardBlocksContent({
          blocks: journey.blocks,
          cardBlocks
        })

        const trimmedDescription = journey.description?.trim() ?? ''
        const hasDescription = Boolean(trimmedDescription)

        yield {
          progress: 40,
          message: 'Translating journey title and description...',
          journey: null
        }

        // Step 1: Analyze and translate journey title, description, and SEO fields
        const combinedPrompt = `
Analyze this journey content and provide the key intent, themes, and target audience.
Also suggest ways to culturally adapt this content for the target language: ${hardenPrompt(input.textLanguageName)}.
Then, translate the following journey title and description to ${hardenPrompt(input.textLanguageName)}.
If a description is not provided, do not create one.

If possible, find a popular translation of the Bible in the target language for Bible translations and include it in the analysis.

${hardenPrompt(`
The source language is: ${input.journeyLanguageName}.
The target language name is: ${input.textLanguageName}.

Journey Title: ${input.name}
${hasDescription ? `Journey Description: ${trimmedDescription}` : ''}

Seo Title: ${journey.seoTitle ?? ''}
Seo Description: ${journey.seoDescription ?? ''}

Journey Content: 
${cardBlocksContent.join('\n')}

`)}

Return in this format:
{
  analysis: [analysis and adaptation suggestions],
  title: [translated title],
  description: [translated description or empty string if no description was provided]
  seoTitle: [translated seo title or empty string if no seo title was provided]
  seoDescription: [translated seo description or empty string if no seo description was provided]
}
`

        const analysisResult = await generateObject({
          model: google('gemini-2.0-flash'),
          system: preSystemPrompt,
          prompt: combinedPrompt,
          schema: JourneyAnalysisSchema
        })

        if (!analysisResult.object.title) {
          throw new GraphQLError('Failed to translate journey title')
        }

        if (hasDescription && !analysisResult.object.description) {
          throw new GraphQLError('Failed to translate journey description')
        }

        // Only validate seoTitle if the original journey had one
        if (journey.seoTitle && !analysisResult.object.seoTitle) {
          throw new GraphQLError('Failed to translate journey seo title')
        }

        // Only validate seoDescription if the original journey had one
        if (journey.seoDescription && !analysisResult.object.seoDescription) {
          throw new GraphQLError('Failed to translate journey seo description')
        }

        yield {
          progress: 70,
          message: 'Updating journey with translated title...',
          journey: null
        }

        // Update journey with translated title, description, and SEO fields
        const updateData: {
          title: string
          languageId: string
          description?: string
          seoTitle?: string
          seoDescription?: string
        } = {
          title: analysisResult.object.title,
          languageId: input.textLanguageId
        }

        if (hasDescription && analysisResult.object.description) {
          updateData.description = analysisResult.object.description
        }

        // Only update seoTitle if the original journey had one
        if (journey.seoTitle && analysisResult.object.seoTitle) {
          updateData.seoTitle = analysisResult.object.seoTitle
        }

        // Only update seoDescription if the original journey had one
        if (journey.seoDescription && analysisResult.object.seoDescription) {
          updateData.seoDescription = analysisResult.object.seoDescription
        }

        const updatedJourney = await prisma.journey.update({
          where: { id: input.journeyId },
          data: updateData,
          include: {
            blocks: true
          }
        })

        yield {
          progress: 80,
          message: `Translating card content (${cardBlocks.length} cards)...`,
          journey: updatedJourney
        }

        // Step 2: Translate blocks for each card with progress updates
        // Use updatedJourney as the working journey object to update with translated blocks
        const translateCard = async (
          cardContent: string,
          cardIndex: number
        ) => {
          try {
            // Get translatable blocks for this card
            const cardBlock = cardBlocks[cardIndex]

            // Get all child blocks of this card
            const cardBlocksChildren = updatedJourney.blocks.filter(
              (block) => block.parentBlockId === cardBlock.id
            )

            // Skip if no children to translate
            if (cardBlocksChildren.length === 0) {
              return
            }

            // Get radio question blocks to find their radio option blocks
            const radioQuestionBlocks = cardBlocksChildren.filter(
              (block) => block.typename === 'RadioQuestionBlock'
            )

            // Find all radio option blocks that need translation
            const radioOptionBlocks = []
            for (const radioQuestionBlock of radioQuestionBlocks) {
              const options = updatedJourney.blocks.filter(
                (block) =>
                  block.parentBlockId === radioQuestionBlock.id &&
                  block.typename === 'RadioOptionBlock'
              )
              radioOptionBlocks.push(...options)
            }

            // All blocks that need translation including radio options
            const allBlocksToTranslate = [
              ...cardBlocksChildren,
              ...radioOptionBlocks
            ]

            // Skip if no blocks to translate
            if (allBlocksToTranslate.length === 0) {
              return
            }

            // Create a more concise representation of blocks to translate
            const blocksToTranslateInfo = allBlocksToTranslate
              .map((block) => {
                let fieldInfo = ''
                switch (block.typename) {
                  case 'TypographyBlock':
                    fieldInfo = `Content: "${block.content || ''}"`
                    break
                  case 'ButtonBlock':
                  case 'RadioOptionBlock':
                    fieldInfo = `Label: "${block.label || ''}"`
                    break
                  case 'TextResponseBlock':
                    fieldInfo = `Label: "${block.label || ''}", Placeholder: "${(block as any).placeholder || ''}"`
                    break
                }

                return `[${block.id}] ${block.typename}: ${fieldInfo}`
              })
              .join('\n')

            const blockTranslationPrompt = `
JOURNEY ANALYSIS AND ADAPTATION SUGGESTIONS:
${hardenPrompt(analysisResult.object.analysis)}

Translate content
${hardenPrompt(`
The source language is: ${input.journeyLanguageName}.
The target language name is: ${input.textLanguageName}.
`)}

CONTEXT:
${hardenPrompt(cardContent)}

TRANSLATE THE FOLLOWING BLOCKS:
${hardenPrompt(blocksToTranslateInfo)}

IMPORTANT: For each block, use ONLY the EXACT IDs in square brackets [ID].
Return an array where each item is an object with:
- blockId: The EXACT ID from square brackets
- updates: An object with field names and translated values

Field names to translate per block type:
- TypographyBlock: "content" field
- ButtonBlock: "label" field
- RadioOptionBlock: "label" field
- TextResponseBlock: "label" and "placeholder" fields

Ensure translations maintain the meaning while being culturally appropriate for ${input.textLanguageName}.
Keep translations concise and effective for UI context (e.g., button labels should remain short).

If you are in the process of translating and you recognize passages from the
Bible you should not translate that content. Instead, you should rely on a Bible
translation available from the previous journey analysis and use that content directly. 
You must never make changes to content from the Bible yourself. 
If there is no Bible translation was available, use the the most popular English Bible translation available. 
`

            // Create a map of valid block IDs for quick lookup
            const validBlockIds = new Set(
              updatedJourney.blocks.map((block) => block.id)
            )

            try {
              // Stream the translations
              const { fullStream } = streamObject({
                model: google('gemini-2.0-flash'),
                system: preSystemPrompt,
                prompt: blockTranslationPrompt,
                output: 'no-schema',
                onError: ({ error }) => {
                  console.warn(
                    `Error in translation stream for card ${cardBlock.id}:`,
                    error
                  )
                }
              })

              let partialTranslations = []

              // Process the stream as chunks arrive
              for await (const chunk of fullStream) {
                // Process object chunks which contain translation data
                if (chunk.type === 'object' && chunk.object) {
                  // Handle streaming array building
                  if (Array.isArray(chunk.object)) {
                    partialTranslations = chunk.object
                    // Process each block in the array
                    for (const item of partialTranslations) {
                      try {
                        // Check if we've already processed this block (in case of duplicate items in stream)
                        if (
                          item &&
                          typeof item === 'object' &&
                          'blockId' in item &&
                          typeof item.blockId === 'string' &&
                          'updates' in item &&
                          typeof item.updates === 'object' &&
                          !Array.isArray(item.updates) &&
                          item.updates !== null
                        ) {
                          // Remove brackets if present
                          const cleanBlockId =
                            typeof item.blockId === 'string'
                              ? item.blockId.replace(/^\[|\]$/g, '')
                              : item.blockId

                          // Verify block ID exists in our journey
                          if (!validBlockIds.has(cleanBlockId)) {
                            continue
                          }

                          await prisma.block.update({
                            where: {
                              id: cleanBlockId,
                              journeyId: input.journeyId
                            },
                            data: item.updates
                          })

                          // Update the in-memory journey blocks
                          const blockIndex = updatedJourney.blocks.findIndex(
                            (block) => block.id === cleanBlockId
                          )
                          if (blockIndex !== -1 && item.updates) {
                            updatedJourney.blocks[blockIndex] = {
                              ...updatedJourney.blocks[blockIndex],
                              ...item.updates
                            }
                          }
                        }
                      } catch (updateError) {
                        if (
                          item &&
                          typeof item === 'object' &&
                          'blockId' in item
                        ) {
                          const blockIdString =
                            typeof item.blockId === 'string'
                              ? item.blockId
                              : JSON.stringify(item.blockId)

                          console.error(
                            `Error updating block ${blockIdString}:`,
                            updateError
                          )
                        } else {
                          console.error(
                            `Error updating unknown block:`,
                            updateError
                          )
                        }
                      }
                    }
                  }
                }
              }
            } catch (error) {
              console.warn(`Error translating card ${cardBlock.id}:`, error)
              // Continue with other cards
            }
          } catch (error) {
            console.error(`Error translating card ${cardIndex + 1}:`, error)
            // Continue with other cards even if one fails
          }
        }

        // Process cards in batches of 5 for parallel processing with progress updates
        const batchSize = 5
        let completedCards = 0

        for (
          let batchStart = 0;
          batchStart < cardBlocksContent.length;
          batchStart += batchSize
        ) {
          const batchEnd = Math.min(
            batchStart + batchSize,
            cardBlocksContent.length
          )
          const currentBatch = cardBlocksContent.slice(batchStart, batchEnd)

          // Create batch of translation promises
          const batchPromises = currentBatch.map((cardContent, index) => {
            const cardIndex = batchStart + index
            return translateCard(cardContent, cardIndex)
          })

          // Process batch in parallel
          await Promise.allSettled(batchPromises)

          // Update completed count and progress
          completedCards += currentBatch.length
          const progressPercent = 80 + (completedCards / cardBlocks.length) * 15

          yield {
            progress: progressPercent,
            message: `Translated ${completedCards} of ${cardBlocks.length} cards`,
            journey: updatedJourney
          }
        }

        yield {
          progress: 95,
          message: 'Finalizing translation...',
          journey: null
        }

        // Get the final updated journey with all translated blocks
        const finalJourney = await prisma.journey.findUnique({
          where: { id: input.journeyId },
          include: {
            blocks: true
          }
        })

        yield {
          progress: 100,
          message: 'Translation completed!',
          journey: finalJourney
        }
      } catch (error) {
        console.error('Translation error:', error)
        yield {
          progress: 100,
          message: 'Translation failed: ' + (error as Error).message,
          journey: null
        }
      }
    },
    resolve: (progressUpdate) => progressUpdate
  })
)

builder.mutationField('journeyAiTranslateCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'Journey',
    nullable: false,
    args: {
      input: t.arg({
        type: JourneyAiTranslateInput,
        required: true
      })
    },
    resolve: async (_query, _root, { input }, { user }) => {
      const originalName = input.name
      // 1. First get the journey details using Prisma
      const journey = await prisma.journey.findUnique({
        where: {
          id: input.journeyId
        },
        include: {
          blocks: true,
          userJourneys: true,
          team: {
            include: { userTeams: true }
          }
        }
      })

      if (!journey) {
        throw new GraphQLError('journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      const trimmedDescription = journey.description?.trim() ?? ''
      const hasDescription = Boolean(trimmedDescription)

      if (!ability(Action.Update, subject('Journey', journey), user)) {
        throw new GraphQLError(
          'user does not have permission to update journey',
          {
            extensions: { code: 'FORBIDDEN' }
          }
        )
      }

      // 2. Get the language names
      const sourceLanguageName = input.journeyLanguageName
      const requestedLanguageName = input.textLanguageName

      // 3. Get Cards Content
      const cardBlocks = journey.blocks
        .filter((block) => block.typename === 'CardBlock')
        .sort((a, b) => (a.parentOrder ?? 0) - (b.parentOrder ?? 0))

      const cardBlocksContent = await getCardBlocksContent({
        blocks: journey.blocks,
        cardBlocks
      })

      // 4. Use Gemini to analyze the journey content and get intent, and translate title/description
      const combinedPrompt = `
Analyze this journey content and provide the key intent, themes, and target audience.
Also suggest ways to culturally adapt this content for the target language: ${hardenPrompt(requestedLanguageName)}.
Then, translate the following journey title and description to ${hardenPrompt(requestedLanguageName)}.
If a description is not provided, do not create one.

If possible, find a popular translation of the Bible in the target language to use in follow up steps.

${hardenPrompt(`
The source language is: ${sourceLanguageName}.
The target language name is: ${requestedLanguageName}.

Journey Title: ${originalName}
${hasDescription ? `Journey Description: ${trimmedDescription}` : ''}

Seo Title: ${journey.seoTitle ?? ''}
Seo Description: ${journey.seoDescription ?? ''}

Journey Content: 
${cardBlocksContent.join('\n')}

`)}

Return in this format:
{
  analysis: [analysis and adaptation suggestions],
  title: [translated title],
  description: [translated description or empty string if no description was provided]
  seoTitle: [translated seo title or empty string if no seo title was provided]
  seoDescription: [translated seo description or empty string if no seo description was provided]
}
`

      try {
        const { object: analysisAndTranslation } = await generateObject({
          model: google('gemini-2.0-flash'),
          system: preSystemPrompt,
          prompt: combinedPrompt,
          schema: JourneyAnalysisSchema
        })

        if (!analysisAndTranslation.title)
          throw new Error('Failed to translate journey title')

        // Only validate description if the original journey had one
        if (hasDescription && !analysisAndTranslation.description)
          throw new Error('Failed to translate journey description')

        // Only validate seoTitle if the original journey had one
        if (journey.seoTitle && !analysisAndTranslation.seoTitle)
          throw new Error('Failed to translate journey seo title')

        // Only validate seoDescription if the original journey had one
        if (journey.seoDescription && !analysisAndTranslation.seoDescription)
          throw new Error('Failed to translate journey seo description')

        // Update the journey using Prisma
        await prisma.journey.update({
          where: {
            id: input.journeyId
          },
          data: {
            title: analysisAndTranslation.title,
            // Only update description if the original journey had one
            ...(hasDescription
              ? { description: analysisAndTranslation.description }
              : {}),
            // Only update seoTitle if the original journey had one
            ...(journey.seoTitle
              ? { seoTitle: analysisAndTranslation.seoTitle }
              : {}),
            // Only update seoDescription if the original journey had one
            ...(journey.seoDescription
              ? { seoDescription: analysisAndTranslation.seoDescription }
              : {}),
            languageId: input.textLanguageId
          }
        })

        // Use analysisAndTranslation.analysis for card translation context
        const journeyAnalysis = analysisAndTranslation.analysis

        // 5. Translate each card
        const cardBlocks = journey.blocks.filter(
          (block) => block.typename === 'CardBlock'
        )

        // Create a map of valid block IDs for quick lookup
        const validBlockIds = new Set(journey.blocks.map((block) => block.id))

        await Promise.all(
          cardBlocks.map(async (cardBlock, i) => {
            const cardContent = cardBlocksContent[i]
            try {
              // Get all child blocks of this card
              const cardBlocksChildren = journey.blocks.filter(
                ({ parentBlockId }) => parentBlockId === cardBlock.id
              )

              // Skip if no children to translate
              if (cardBlocksChildren.length === 0) {
                return
              }

              // Get radio question blocks to find their radio option blocks
              const radioQuestionBlocks = cardBlocksChildren.filter(
                (block) => block.typename === 'RadioQuestionBlock'
              )

              // Find all radio option blocks that need translation
              const radioOptionBlocks = []
              for (const radioQuestionBlock of radioQuestionBlocks) {
                const options = journey.blocks.filter(
                  (block) =>
                    block.parentBlockId === radioQuestionBlock.id &&
                    block.typename === 'RadioOptionBlock'
                )
                radioOptionBlocks.push(...options)
              }

              // All blocks that need translation including radio options
              const allBlocksToTranslate = [
                ...cardBlocksChildren,
                ...radioOptionBlocks
              ]

              // Skip if no blocks to translate
              if (allBlocksToTranslate.length === 0) {
                return
              }

              // Create a more concise representation of blocks to translate
              const blocksToTranslateInfo = allBlocksToTranslate
                .map((block) => {
                  let fieldInfo = ''
                  switch (block.typename) {
                    case 'TypographyBlock':
                      fieldInfo = `Content: "${block.content || ''}"`
                      break
                    case 'ButtonBlock':
                    case 'RadioOptionBlock':
                      fieldInfo = `Label: "${block.label || ''}"`
                      break
                    case 'TextResponseBlock':
                      fieldInfo = `Label: "${block.label || ''}", Placeholder: "${(block as any).placeholder || ''}"`
                      break
                  }

                  return `[${block.id}] ${block.typename}: ${fieldInfo}`
                })
                .join('\n')

              // Create prompt for translation
              const cardAnalysisPrompt = `
JOURNEY ANALYSIS AND ADAPTATION SUGGESTIONS:
${hardenPrompt(journeyAnalysis)}

Translate content
${hardenPrompt(`
The source language is: ${sourceLanguageName}.
The target language name is: ${requestedLanguageName}.
`)}

CONTEXT:
${hardenPrompt(cardContent)}

TRANSLATE THE FOLLOWING BLOCKS:
${hardenPrompt(blocksToTranslateInfo)}

IMPORTANT: For each block, use ONLY the EXACT IDs in square brackets [ID].
Return an array where each item is an object with:
- blockId: The EXACT ID from square brackets
- updates: An object with field names and translated values

Field names to translate per block type:
- TypographyBlock: "content" field
- ButtonBlock: "label" field
- RadioOptionBlock: "label" field
- TextResponseBlock: "label" and "placeholder" fields

Ensure translations maintain the meaning while being culturally appropriate for ${hardenPrompt(requestedLanguageName)}.
Keep translations concise and effective for UI context (e.g., button labels should remain short).

If you are in the process of translating and you recognize passages from the
Bible you should not translate that content. Instead, you should rely on a Bible
translation available from the previous journey analysis and use that content directly. 
You must never make changes to content from the Bible yourself. 
If there is no Bible translation was available, use the the most popular English Bible translation available. 
`
              try {
                // Stream the translations
                const { fullStream } = streamObject({
                  model: google('gemini-2.0-flash'),
                  system: preSystemPrompt,
                  prompt: cardAnalysisPrompt,
                  output: 'no-schema',
                  onError: ({ error }) => {
                    console.warn(
                      `Error in translation stream for card ${cardBlock.id}:`,
                      error
                    )
                  }
                })

                let partialTranslations = []

                // Process the stream as chunks arrive
                for await (const chunk of fullStream) {
                  // Process object chunks which contain translation data
                  if (chunk.type === 'object' && chunk.object) {
                    // Handle streaming array building
                    if (Array.isArray(chunk.object)) {
                      partialTranslations = chunk.object
                      // Process each block in the array
                      for (const item of partialTranslations) {
                        try {
                          // Check if we've already processed this block (in case of duplicate items in stream)
                          if (
                            item &&
                            typeof item === 'object' &&
                            'blockId' in item &&
                            typeof item.blockId === 'string' &&
                            'updates' in item &&
                            typeof item.updates === 'object' &&
                            !Array.isArray(item.updates) &&
                            item.updates !== null
                          ) {
                            // Remove brackets if present
                            const cleanBlockId =
                              typeof item.blockId === 'string'
                                ? item.blockId.replace(/^\[|\]$/g, '')
                                : item.blockId

                            // Verify block ID exists in our journey
                            if (!validBlockIds.has(cleanBlockId)) {
                              return
                            }
                            await prisma.block.update({
                              where: {
                                id: cleanBlockId,
                                journeyId: input.journeyId
                              },
                              data: item.updates
                            })
                          }
                        } catch (updateError) {
                          if (
                            item &&
                            typeof item === 'object' &&
                            'blockId' in item
                          ) {
                            const blockIdString =
                              typeof item.blockId === 'string'
                                ? item.blockId
                                : JSON.stringify(item.blockId)

                            console.error(
                              `Error updating block ${blockIdString}:`,
                              updateError
                            )
                          } else {
                            console.error(
                              `Error updating unknown block:`,
                              updateError
                            )
                          }
                        }
                      }
                    }
                  }
                }
              } catch (error) {
                console.warn(`Error translating card ${cardBlock.id}:`, error)
                // Continue with other cards
              }
            } catch (error) {
              console.warn(
                `Error analyzing and translating card ${cardBlock.id}:`,
                error
              )
              // Continue with other cards
            }
          })
        )
      } catch (error: unknown) {
        console.error('Error analyzing journey with Gemini:', error)
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred'
        throw new Error(`Failed to analyze journey: ${errorMessage}`)
      }
      // Fetch and return the updated journey with all necessary relations
      const updatedJourney = await prisma.journey.findUnique({
        where: { id: input.journeyId },
        include: {
          blocks: true
          // Add other relations as needed for the full object
        }
      })
      if (!updatedJourney) throw new Error('Could not fetch updated journey')
      return updatedJourney
    }
  })
)
