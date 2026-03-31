import { google } from '@ai-sdk/google'
import { Output, generateText, streamText } from 'ai'
import { GraphQLError } from 'graphql'
import { z } from 'zod'

import { prisma } from '@core/prisma/journeys/client'
import { hardenPrompt, preSystemPrompt } from '@core/shared/ai/prompts'

import { Action, ability, subject } from '../../lib/auth/ability'
import { builder } from '../builder'
import { JourneyRef } from '../journey/journey'

import { getCardBlocksContent } from './getCardBlocksContent'
import { translateCustomizationFields } from './translateCustomizationFields'

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

const BlockTranslationUpdatesSchema = z
  .object({
    content: z.string().optional(),
    label: z.string().optional(),
    placeholder: z.string().optional()
  })
  .refine((updates) => Object.keys(updates).length > 0, {
    message: 'At least one supported update field is required'
  })

const BlockTranslationSchema = z.object({
  blockId: z.string().describe('The block id to update'),
  updates: BlockTranslationUpdatesSchema.describe('Translated block fields')
})

type TranslatableBlockField = keyof z.infer<
  typeof BlockTranslationUpdatesSchema
>

const allowedTranslationFieldsByBlockType = {
  TypographyBlock: ['content'],
  ButtonBlock: ['label'],
  RadioOptionBlock: ['label'],
  TextResponseBlock: ['label', 'placeholder']
} as const satisfies Record<string, readonly TranslatableBlockField[]>

function getValidatedBlockUpdates(
  block: { typename: string },
  updates: z.infer<typeof BlockTranslationUpdatesSchema>
): Partial<Record<TranslatableBlockField, string>> | null {
  const allowedFields =
    allowedTranslationFieldsByBlockType[
      block.typename as keyof typeof allowedTranslationFieldsByBlockType
    ]

  if (allowedFields == null) {
    return null
  }

  const validatedUpdates = Object.fromEntries(
    allowedFields.flatMap((field) => {
      const value = updates[field]
      return typeof value === 'string' ? [[field, value]] : []
    })
  ) as Partial<Record<TranslatableBlockField, string>>

  return Object.keys(validatedUpdates).length > 0 ? validatedUpdates : null
}

// Define the shared input type
const JourneyAiTranslateInput = builder.inputType('JourneyAiTranslateInput', {
  fields: (t) => ({
    journeyId: t.id({
      required: true,
      description: 'The ID of the journey to translate'
    }),
    name: t.string({
      required: true,
      description: 'The journey name to translate'
    }),
    journeyLanguageName: t.string({
      required: true,
      description: 'The source language name of the journey content'
    }),
    textLanguageId: t.id({
      required: true,
      description:
        'The target language ID for journey content (blocks, title, description)'
    }),
    textLanguageName: t.string({
      required: true,
      description:
        'The target language name for journey content (blocks, title, description)'
    }),
    userLanguageId: t.id({
      required: false,
      description:
        'Language ID for customization text translation. Falls back to textLanguageId if not provided.'
    }),
    userLanguageName: t.string({
      required: false,
      description:
        'Language name for customization text translation. Falls back to textLanguageName if not provided.'
    })
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
            journeyCustomizationFields: true,
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

        const { output: analysisResult } = await generateText({
          model: google('gemini-2.5-flash'),
          messages: [
            {
              role: 'system',
              content: preSystemPrompt
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: combinedPrompt
                }
              ]
            }
          ],
          output: Output.object({
            schema: JourneyAnalysisSchema
          })
        })

        if (!analysisResult.title) {
          throw new GraphQLError('Failed to translate journey title')
        }

        if (hasDescription && !analysisResult.description) {
          throw new GraphQLError('Failed to translate journey description')
        }

        // Only validate seoTitle if the original journey had one
        if (journey.seoTitle && !analysisResult.seoTitle) {
          throw new GraphQLError('Failed to translate journey seo title')
        }

        // Only validate seoDescription if the original journey had one
        if (journey.seoDescription && !analysisResult.seoDescription) {
          throw new GraphQLError('Failed to translate journey seo description')
        }

        yield {
          progress: 70,
          message: 'Translating customization fields...',
          journey: null
        }

        const customizationLanguageName =
          input.userLanguageName ?? input.textLanguageName

        // Translate customization fields and description
        const customizationTranslation = await translateCustomizationFields({
          journeyCustomizationDescription:
            journey.journeyCustomizationDescription,
          journeyCustomizationFields: journey.journeyCustomizationFields,
          sourceLanguageName: input.journeyLanguageName,
          targetLanguageName: customizationLanguageName,
          defaultValueTargetLanguageName: input.textLanguageName,
          journeyAnalysis: analysisResult.analysis
        })

        // Update customization field values in the database
        if (customizationTranslation.translatedFields.length > 0) {
          await Promise.all(
            customizationTranslation.translatedFields.map((field) =>
              prisma.journeyCustomizationField.update({
                where: { id: field.id },
                data: {
                  value: field.translatedValue,
                  defaultValue: field.translatedDefaultValue
                }
              })
            )
          )
        }

        yield {
          progress: 75,
          message: 'Updating journey with translated title...',
          journey: null
        }

        // Update journey with translated title, description, SEO fields, and customization description
        const updateData: {
          title: string
          languageId: string
          description?: string
          seoTitle?: string
          seoDescription?: string
          journeyCustomizationDescription?: string
        } = {
          title: analysisResult.title,
          languageId: input.textLanguageId
        }

        if (hasDescription && analysisResult.description) {
          updateData.description = analysisResult.description
        }

        // Only update seoTitle if the original journey had one
        if (journey.seoTitle && analysisResult.seoTitle) {
          updateData.seoTitle = analysisResult.seoTitle
        }

        // Only update seoDescription if the original journey had one
        if (journey.seoDescription && analysisResult.seoDescription) {
          updateData.seoDescription = analysisResult.seoDescription
        }

        // Update customization description if it was translated
        if (customizationTranslation.translatedDescription !== null) {
          updateData.journeyCustomizationDescription =
            customizationTranslation.translatedDescription
        }

        const updatedJourney = await prisma.journey.update({
          where: { id: input.journeyId },
          data: updateData,
          include: {
            blocks: true,
            journeyCustomizationFields: true
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
${hardenPrompt(analysisResult.analysis)}

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

IMPORTANT: Do not translate or modify anything inside curly braces {{ }}. Only use it for context when translating text outside the curly braces.

Ensure translations maintain the meaning while being culturally appropriate for ${input.textLanguageName}.
Keep translations concise and effective for UI context (e.g., button labels should remain short).

If you are in the process of translating and you recognize passages from the
Bible you should not translate that content. Instead, you should rely on a Bible
translation available from the previous journey analysis and use that content directly. 
You must never make changes to content from the Bible yourself. 
If there is no Bible translation was available, use the the most popular English Bible translation available. 
`

            const allowedBlockIdsForCard = new Set(
              allBlocksToTranslate.map((block) => block.id)
            )

            try {
              // Stream the translations
              const { elementStream } = streamText({
                model: google('gemini-2.5-flash'),
                messages: [
                  {
                    role: 'system',
                    content: preSystemPrompt
                  },
                  {
                    role: 'user',
                    content: [
                      {
                        type: 'text',
                        text: blockTranslationPrompt
                      }
                    ]
                  }
                ],
                output: Output.array({
                  element: BlockTranslationSchema
                }),
                onError: ({ error }) => {
                  console.warn(
                    `Error in translation stream for card ${cardBlock.id}:`,
                    error
                  )
                }
              })

              for await (const item of elementStream) {
                try {
                  const cleanBlockId = item.blockId.replace(/^\[|\]$/g, '')

                  // Verify the block belongs to the current card translation batch
                  if (!allowedBlockIdsForCard.has(cleanBlockId)) {
                    continue
                  }

                  const blockToUpdate = updatedJourney.blocks.find(
                    (block) => block.id === cleanBlockId
                  )

                  if (blockToUpdate == null) {
                    continue
                  }

                  const validatedUpdates = getValidatedBlockUpdates(
                    blockToUpdate,
                    item.updates
                  )

                  if (validatedUpdates == null) {
                    continue
                  }

                  await prisma.block.update({
                    where: {
                      id: cleanBlockId,
                      journeyId: input.journeyId
                    },
                    data: validatedUpdates
                  })

                  // Update the in-memory journey blocks
                  const blockIndex = updatedJourney.blocks.findIndex(
                    (block) => block.id === cleanBlockId
                  )
                  if (blockIndex !== -1) {
                    updatedJourney.blocks[blockIndex] = {
                      ...updatedJourney.blocks[blockIndex],
                      ...validatedUpdates
                    }
                  }
                } catch (updateError) {
                  console.error(
                    `Error updating block ${item.blockId}:`,
                    updateError
                  )
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
            blocks: true,
            journeyCustomizationFields: true
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
          journeyCustomizationFields: true,
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
        const { output: analysisAndTranslation } = await generateText({
          model: google('gemini-2.5-flash'),
          messages: [
            {
              role: 'system',
              content: preSystemPrompt
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: combinedPrompt
                }
              ]
            }
          ],
          output: Output.object({
            schema: JourneyAnalysisSchema
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

        const customizationLanguageName =
          input.userLanguageName ?? input.textLanguageName

        // Translate customization fields and description
        const customizationTranslation = await translateCustomizationFields({
          journeyCustomizationDescription:
            journey.journeyCustomizationDescription,
          journeyCustomizationFields: journey.journeyCustomizationFields,
          sourceLanguageName: input.journeyLanguageName,
          targetLanguageName: customizationLanguageName,
          defaultValueTargetLanguageName: input.textLanguageName,
          journeyAnalysis: analysisAndTranslation.analysis
        })

        // Update customization field values in the database
        if (customizationTranslation.translatedFields.length > 0) {
          await Promise.all(
            customizationTranslation.translatedFields.map((field) =>
              prisma.journeyCustomizationField.update({
                where: { id: field.id },
                data: {
                  value: field.translatedValue,
                  defaultValue: field.translatedDefaultValue
                }
              })
            )
          )
        }

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
            // Update customization description if it was translated
            ...(customizationTranslation.translatedDescription !== null
              ? {
                  journeyCustomizationDescription:
                    customizationTranslation.translatedDescription
                }
              : {}),
            languageId: input.textLanguageId
          }
        })

        // Use analysisAndTranslation.analysis for card translation context
        const journeyAnalysis = analysisAndTranslation.analysis

        // 5. Translate each card (reuses sorted cardBlocks from above)
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

              const allowedBlockIdsForCard = new Set(
                allBlocksToTranslate.map((block) => block.id)
              )

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

IMPORTANT: Do not translate or modify anything inside curly braces {{ }}. Only use it for context when translating text outside the curly braces.

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
                const { elementStream } = streamText({
                  model: google('gemini-2.5-flash'),
                  messages: [
                    {
                      role: 'system',
                      content: preSystemPrompt
                    },
                    {
                      role: 'user',
                      content: [
                        {
                          type: 'text',
                          text: cardAnalysisPrompt
                        }
                      ]
                    }
                  ],
                  output: Output.array({
                    element: BlockTranslationSchema
                  }),
                  onError: ({ error }) => {
                    console.warn(
                      `Error in translation stream for card ${cardBlock.id}:`,
                      error
                    )
                  }
                })

                for await (const item of elementStream) {
                  try {
                    const cleanBlockId = item.blockId.replace(/^\[|\]$/g, '')

                    // Verify the block belongs to the current card translation batch
                    if (!allowedBlockIdsForCard.has(cleanBlockId)) {
                      continue
                    }

                    const blockToUpdate = journey.blocks.find(
                      (block) => block.id === cleanBlockId
                    )

                    if (blockToUpdate == null) {
                      continue
                    }

                    const validatedUpdates = getValidatedBlockUpdates(
                      blockToUpdate,
                      item.updates
                    )

                    if (validatedUpdates == null) {
                      continue
                    }

                    await prisma.block.update({
                      where: {
                        id: cleanBlockId,
                        journeyId: input.journeyId
                      },
                      data: validatedUpdates
                    })
                  } catch (updateError) {
                    console.error(
                      `Error updating block ${item.blockId}:`,
                      updateError
                    )
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
          blocks: true,
          journeyCustomizationFields: true
        }
      })
      if (!updatedJourney) throw new Error('Could not fetch updated journey')
      return updatedJourney
    }
  })
)
