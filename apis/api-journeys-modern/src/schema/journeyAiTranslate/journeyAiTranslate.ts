import { google } from '@ai-sdk/google'
import { generateObject, streamObject } from 'ai'
import { GraphQLError } from 'graphql'
import { z } from 'zod'

import { hardenPrompt, preSystemPrompt } from '@core/shared/ai/prompts'

import { Action, ability, subject } from '../../lib/auth/ability'
import { prisma } from '../../lib/prisma'
import {
  castBlock,
  createTranslationInfo,
  updateBlockWithTranslation
} from '../../lib/translation/blockTranslation'
import {
  AIBlockTranslationUpdate,
  AnyBlock,
  BlockTranslationUpdate
} from '../../lib/types/block'
import { builder } from '../builder'

import { getCardBlocksContent } from './getCardBlocksContent'

// Define the translation progress interface
interface JourneyAiTranslateProgress {
  progress: number
  message: string
  journey: any | null
}

// Define the translation progress type
const JourneyAiTranslateProgressRef =
  builder.objectRef<JourneyAiTranslateProgress>('JourneyAiTranslateProgress')

builder.objectType(JourneyAiTranslateProgressRef, {
  fields: (t) => ({
    progress: t.exposeFloat('progress', {
      description: 'Translation progress as a percentage (0-100)'
    }),
    message: t.exposeString('message', {
      description: 'Current translation step message'
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

builder.subscriptionField('journeyAiTranslateCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: JourneyAiTranslateProgressRef,
    nullable: false,
    args: {
      input: t.arg({
        type: builder.inputType('JourneyAiTranslateInput', {
          fields: (t) => ({
            journeyId: t.id({ required: true }),
            name: t.string({ required: true }),
            journeyLanguageName: t.string({ required: true }),
            textLanguageId: t.id({ required: true }),
            textLanguageName: t.string({ required: true })
          })
        }),
        required: true
      })
    },
    subscribe: async (_root, { input }, { user }) => {
      // Create an async generator to yield progress updates
      async function* translateJourney() {
        // Yield initial progress
        yield {
          progress: 0,
          message: 'Starting translation...',
          journey: null
        }

        const originalName = input.name

        // Yield progress for journey validation
        yield {
          progress: 10,
          message: 'Validating journey...',
          journey: null
        }

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

        if (!ability(Action.Update, subject('Journey', journey), user)) {
          throw new GraphQLError(
            'user does not have permission to update journey',
            {
              extensions: { code: 'FORBIDDEN' }
            }
          )
        }

        // Yield progress for content analysis
        yield {
          progress: 20,
          message: 'Analyzing journey content...',
          journey: null
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
${journey.description ? `Journey Description: ${journey.description}` : ''}

Journey Content: 
${cardBlocksContent.join('\n')}

`)}

Return in this format:
{
  analysis: [analysis and adaptation suggestions],
  title: [translated title],
  description: [translated description or empty string if no description was provided]
}
`

        // Yield progress for AI analysis
        yield {
          progress: 30,
          message: 'Translating journey title and description...',
          journey: null
        }

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
              description: z.string()
            })
          })

          if (!analysisAndTranslation.title)
            throw new Error('Failed to translate journey title')

          // Only validate description if the original journey had one
          if (journey.description && !analysisAndTranslation.description)
            throw new Error('Failed to translate journey description')

          // Yield progress for journey update
          yield {
            progress: 50,
            message: 'Updating journey with translated title...',
            journey: null
          }

          // Update the journey using Prisma
          const updatedJourney = await prisma.journey.update({
            where: {
              id: input.journeyId
            },
            data: {
              title: analysisAndTranslation.title,
              // Only update description if the original journey had one
              ...(journey.description
                ? { description: analysisAndTranslation.description }
                : {}),
              languageId: input.textLanguageId
            },
            include: {
              blocks: true,
              userJourneys: true,
              team: {
                include: { userTeams: true }
              }
            }
          })

          // Use analysisAndTranslation.analysis for card translation context
          const journeyAnalysis = analysisAndTranslation.analysis

          // 5. Translate each card
          const cardBlocksToTranslate = journey.blocks.filter(
            (block) => block.typename === 'CardBlock'
          )

          // Yield progress for card translation start
          yield {
            progress: 60,
            message: `Translating ${cardBlocksToTranslate.length} cards...`,
            journey: null
          }

          // Create a map of valid block IDs for quick lookup
          const validBlockIds = new Set(journey.blocks.map((block) => block.id))

          // Track progress for each card
          let completedCards = 0
          const totalCards = cardBlocksToTranslate.length

          // Process cards sequentially to provide better progress updates
          for (let i = 0; i < cardBlocksToTranslate.length; i++) {
            const cardBlock = cardBlocksToTranslate[i]
            const cardContent = cardBlocksContent[i]

            // Yield progress for current card
            yield {
              progress: 60 + (i / totalCards) * 30, // 60-90% for card translation
              message: `Translating card ${i + 1} of ${totalCards}...`,
              journey: null
            }

            try {
              // Get all child blocks of this card
              const cardBlocksChildren = journey.blocks.filter(
                ({ parentBlockId }) => parentBlockId === cardBlock.id
              )

              // Skip if no children to translate
              if (cardBlocksChildren.length === 0) {
                continue
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
                continue
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
                    case 'RadioQuestionBlock':
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
- RadioQuestionBlock: "label" field
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
                      partialTranslations =
                        chunk.object as unknown as AIBlockTranslationUpdate[]
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

            completedCards++
          }

          // Yield progress for completion
          yield {
            progress: 95,
            message: 'Finalizing translation...',
            journey: null
          }

          // Fetch and return the final updated journey with all necessary relations
          const finalJourney = await prisma.journey.findUnique({
            where: { id: input.journeyId },
            include: {
              blocks: true
              // Add other relations as needed for the full object
            }
          })

          if (!finalJourney) throw new Error('Could not fetch updated journey')

          // Yield the final result with 100% progress
          yield {
            progress: 100,
            message: 'Translation completed!',
            journey: finalJourney
          }
        } catch (error: unknown) {
          console.error('Error analyzing journey with Gemini:', error)
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred'
          throw new Error(`Failed to analyze journey: ${errorMessage}`)
        }
      }

      return translateJourney()
    },
    resolve: (progressUpdate) => {
      return progressUpdate
    }
  })
)
