import { google } from '@ai-sdk/google'
import { generateObject, streamObject } from 'ai'
import { GraphQLError } from 'graphql'
import { z } from 'zod'

import { VideoBlockSource } from '.prisma/api-journeys-modern-client'
import { hardenPrompt, preSystemPrompt } from '@core/shared/ai/prompts'

import { Action, ability, subject } from '../../lib/auth/ability'
import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import { JourneyRef } from '../journey/journey'

import {
  BlockTranslationUpdate,
  createTranslationInfo,
  getTranslatableFields,
  updateBlockWithTranslation
} from './blockTranslation'
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
  description: z.string().describe('Translated journey description')
})

const BlockTranslationSchema = z.array(
  z.object({
    blockId: z.string().describe('The ID of the block to update'),
    updates: z
      .record(z.string())
      .describe('Key-value pairs of fields to update')
  })
)

// Define the shared input type
const JourneyAiTranslateInput = builder.inputType('JourneyAiTranslateInput', {
  fields: (t) => ({
    journeyId: t.id({ required: true }),
    name: t.string({ required: true }),
    journeyLanguageName: t.string({ required: true }),
    textLanguageId: t.id({ required: true }),
    textLanguageName: t.string({ required: true }),
    videoLanguageId: t.id()
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

        const journeyContent = `
  Journey Title: ${journey.title}
  Journey Description: ${hasDescription ? trimmedDescription : 'No description'}
  
  ${cardBlocksContent.join('\n\n')}
                `.trim()

        yield {
          progress: 40,
          message: 'Translating journey title and description...',
          journey: null
        }

        // Step 1: Translate journey title and description
        const analysisPrompt = `
  You are a professional translator specializing in religious and spiritual content. 
  Translate the following journey from ${input.journeyLanguageName} to ${input.textLanguageName}.
  
  Please provide:
  1. A brief analysis of the content and any cultural considerations
  2. A translated title that maintains the original meaning and impact
  3. A translated description (if one exists)
  
  Ensure the translation is culturally appropriate and maintains the spiritual context.
  
  Journey to translate:
  ${hardenPrompt(journeyContent)}
                `.trim()

        const analysisResult = await generateObject({
          model: google('gemini-1.5-flash'),
          messages: [
            { role: 'system', content: preSystemPrompt },
            { role: 'user', content: analysisPrompt }
          ],
          schema: JourneyAnalysisSchema
        })

        if (!analysisResult.object.title) {
          throw new GraphQLError('Failed to translate journey title')
        }

        if (hasDescription && !analysisResult.object.description) {
          throw new GraphQLError('Failed to translate journey description')
        }

        yield {
          progress: 60,
          message: 'Updating journey with translated title...',
          journey: null
        }

        // Update journey with translated title and description
        const updateData: {
          title: string
          languageId: string
          description?: string
        } = {
          title: analysisResult.object.title,
          languageId: input.textLanguageId
        }

        if (hasDescription && analysisResult.object.description) {
          updateData.description = analysisResult.object.description
        }

        const updatedJourney = await prisma.journey.update({
          where: { id: input.journeyId },
          data: updateData,
          include: {
            blocks: true
          }
        })

        // Update video blocks' videoVariantLanguageId if videoLanguageId is provided
        if (input.videoLanguageId) {
          yield {
            progress: 70,
            message: 'Updating video language settings...',
            journey: updatedJourney
          }

          await prisma.block.updateMany({
            where: {
              journeyId: input.journeyId,
              typename: 'VideoBlock',
              source: VideoBlockSource.internal
            },
            data: {
              videoVariantLanguageId: input.videoLanguageId
            }
          })
        }

        // Refetch journey to include updated video blocks
        const journeyWithUpdatedVideos = await prisma.journey.findUnique({
          where: { id: input.journeyId },
          include: {
            blocks: true
          }
        })

        yield {
          progress: 80,
          message: `Translating card content (${cardBlocks.length} cards)...`,
          journey: journeyWithUpdatedVideos
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
            const cardChildren = updatedJourney.blocks.filter(
              (block) => block.parentBlockId === cardBlock.id
            )

            const translatableBlocks = cardChildren.filter((block) => {
              const fields = Object.keys(getTranslatableFields(block))
              return fields.length > 0
            })

            if (translatableBlocks.length === 0) {
              return
            }

            // Create translation info for each block
            const blockInfos = translatableBlocks.map((block) =>
              createTranslationInfo(block)
            )

            const blockTranslationPrompt = `
  Translate the following blocks from ${input.journeyLanguageName} to ${input.textLanguageName}.
  
  Context: ${hardenPrompt(analysisResult.object.analysis)}
  
  Card content:
  ${hardenPrompt(cardContent)}
  
  Blocks to translate:
  ${hardenPrompt(blockInfos.join('\n'))}
  
  For each block, provide the blockId and the translated field values.
  Only include fields that need translation (content, label, placeholder).
  Maintain the spiritual and religious context appropriately.
                    `.trim()

            // Stream the block translations
            const blockTranslationResult = await streamObject({
              model: google('gemini-1.5-flash'),
              messages: [
                { role: 'system', content: preSystemPrompt },
                { role: 'user', content: blockTranslationPrompt }
              ],
              schema: BlockTranslationSchema
            })

            // Process the streamed translations
            for await (const chunk of blockTranslationResult.fullStream) {
              if (chunk.type === 'object' && chunk.object) {
                // Apply translations to blocks in database
                for (const translation of chunk.object) {
                  if (!translation || !translation.blockId) {
                    continue
                  }

                  await updateBlockWithTranslation(
                    prisma,
                    input.journeyId,
                    translation as unknown as BlockTranslationUpdate
                  )

                  // Update the in-memory journey blocks
                  const blockIndex = updatedJourney.blocks.findIndex(
                    (block) => block.id === translation.blockId
                  )
                  if (blockIndex !== -1 && translation.updates) {
                    updatedJourney.blocks[blockIndex] = {
                      ...updatedJourney.blocks[blockIndex],
                      ...translation.updates
                    }
                  }
                }
              }
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

If possible, find a populare translation of the Bible in the target language to use in follow up steps.

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
          messages: [
            { role: 'system', content: preSystemPrompt },
            { role: 'user', content: combinedPrompt }
          ],
          schema: z.object({
            analysis: z.string(),
            title: z.string(),
            description: z.string(),
            seoTitle: z.string(),
            seoDescription: z.string()
          })
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

        // Update video blocks' videoVariantLanguageId if videoLanguageId is provided
        if (input.videoLanguageId) {
          await prisma.block.updateMany({
            where: {
              journeyId: input.journeyId,
              typename: 'VideoBlock',
              source: VideoBlockSource.internal
            },
            data: {
              videoVariantLanguageId: input.videoLanguageId
            }
          })
        }

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
                  messages: [
                    { role: 'system', content: preSystemPrompt },
                    { role: 'user', content: cardAnalysisPrompt }
                  ],
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
