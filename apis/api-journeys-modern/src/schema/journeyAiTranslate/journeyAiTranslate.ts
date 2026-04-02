import { google } from '@ai-sdk/google'
import { Output, generateText, streamText } from 'ai'
import { GraphQLError } from 'graphql'
import { z } from 'zod'

import { Block, prisma } from '@core/prisma/journeys/client'
import { hardenPrompt, preSystemPrompt } from '@core/shared/ai/prompts'

import { Action, ability, subject } from '../../lib/auth/ability'
import { builder } from '../builder'
import { JourneyRef } from '../journey/journey'

import {
  createTranslationInfo,
  getTranslatableFields
} from './blockTranslation'
import { getCardBlocksContent } from './getCardBlocksContent'
import { translateCustomizationFields } from './translateCustomizationFields'

const TRANSLATION_SYSTEM_PROMPT = `${preSystemPrompt}

You are a professional translator for interactive journey content.
- Translate accurately while being culturally appropriate for the target language
- Keep UI text (button labels, placeholders) concise and natural
- Preserve all {{variable}} template syntax exactly as-is — never translate content inside {{ }}
- For Bible passages, use an established translation in the target language — never translate scripture yourself. If none is identified, use the most popular English Bible translation.
- DO NOT translate proper nouns`

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
        return parent.journey ? { ...query, ...parent.journey } : null
      }
    })
  })
})

// Define Zod schemas for AI responses
const JourneyAnalysisSchema = z.object({
  analysis: z
    .string()
    .describe(
      'Analysis of journey themes, target audience, cultural considerations, and identified Bible translation for the target language'
    ),
  title: z.string().describe('Translated journey title'),
  description: z
    .string()
    .describe(
      'Translated journey description, or empty string if none was provided'
    ),
  seoTitle: z
    .string()
    .describe('Translated SEO title, or empty string if none was provided'),
  seoDescription: z
    .string()
    .describe(
      'Translated SEO description, or empty string if none was provided'
    )
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

  if (allowedFields == null) return null

  const validatedUpdates = Object.fromEntries(
    allowedFields.flatMap((field) => {
      const value = updates[field]
      return typeof value === 'string' ? [[field, value]] : []
    })
  ) as Partial<Record<TranslatableBlockField, string>>

  return Object.keys(validatedUpdates).length > 0 ? validatedUpdates : null
}

// --- Shared helpers for mutation and subscription ---

function getTranslatableBlocksForCard(
  allBlocks: Block[],
  cardBlock: Block
): Block[] {
  const cardChildren = allBlocks.filter(
    (block) => block.parentBlockId === cardBlock.id
  )

  const radioOptionBlocks = cardChildren
    .filter((block) => block.typename === 'RadioQuestionBlock')
    .flatMap((rq) =>
      allBlocks.filter(
        (block) =>
          block.parentBlockId === rq.id && block.typename === 'RadioOptionBlock'
      )
    )

  return [...cardChildren, ...radioOptionBlocks].filter((block) => {
    const fields = getTranslatableFields(block)
    return Object.values(fields).some((v) => v != null && v !== '')
  })
}

function buildAnalysisPrompt({
  sourceLanguageName,
  targetLanguageName,
  journeyTitle,
  journeyDescription,
  seoTitle,
  seoDescription,
  cardBlocksContent
}: {
  sourceLanguageName: string
  targetLanguageName: string
  journeyTitle: string
  journeyDescription: string | null
  seoTitle: string | null
  seoDescription: string | null
  cardBlocksContent: string[]
}): string {
  const trimmedDescription = journeyDescription?.trim() ?? ''
  const hasDescription = Boolean(trimmedDescription)

  return `Translate this journey from ${hardenPrompt(sourceLanguageName)} to ${hardenPrompt(targetLanguageName)}.

Analyze the content first: identify themes, target audience, and cultural adaptation needs.
If the content references the Bible, identify the most appropriate Bible translation in the target language.
Fields marked as "(not provided)" must return empty strings.

${hardenPrompt(`Journey Title: ${journeyTitle}
${hasDescription ? `Journey Description: ${trimmedDescription}` : '(No description provided)'}
${seoTitle ? `SEO Title: ${seoTitle}` : '(No SEO title provided)'}
${seoDescription ? `SEO Description: ${seoDescription}` : '(No SEO description provided)'}

Journey Content:
${cardBlocksContent.join('\n')}`)}`
}

async function translateCardBlocks({
  allBlocks,
  cardBlock,
  journeyId,
  cardContent,
  journeyAnalysis,
  sourceLanguageName,
  targetLanguageName,
  onBlockUpdated
}: {
  allBlocks: Block[]
  cardBlock: Block
  journeyId: string
  cardContent: string
  journeyAnalysis: string
  sourceLanguageName: string
  targetLanguageName: string
  onBlockUpdated?: (
    blockId: string,
    updates: Partial<Record<TranslatableBlockField, string>>
  ) => void
}): Promise<void> {
  const blocksToTranslate = getTranslatableBlocksForCard(allBlocks, cardBlock)
  if (blocksToTranslate.length === 0) return

  const allowedBlockIds = new Set(blocksToTranslate.map((b) => b.id))
  const blocksInfo = blocksToTranslate
    .map((block) => createTranslationInfo(block))
    .join('\n')

  const prompt = `Context from journey analysis:
${hardenPrompt(journeyAnalysis)}

Translate from ${hardenPrompt(sourceLanguageName)} to ${hardenPrompt(targetLanguageName)}.

Card context:
${hardenPrompt(cardContent)}

Blocks to translate (use the EXACT IDs shown in square brackets as blockId):
${hardenPrompt(blocksInfo)}`

  const { elementStream } = streamText({
    model: google('gemini-2.5-flash'),
    messages: [
      { role: 'system', content: TRANSLATION_SYSTEM_PROMPT },
      {
        role: 'user',
        content: [{ type: 'text', text: prompt }]
      }
    ],
    output: Output.array({ element: BlockTranslationSchema }),
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

      if (!allowedBlockIds.has(cleanBlockId)) continue

      const blockToUpdate = allBlocks.find((b) => b.id === cleanBlockId)
      if (blockToUpdate == null) continue

      const validatedUpdates = getValidatedBlockUpdates(
        blockToUpdate,
        item.updates
      )
      if (validatedUpdates == null) continue

      await prisma.block.update({
        where: { id: cleanBlockId, journeyId },
        data: validatedUpdates
      })

      onBlockUpdated?.(cleanBlockId, validatedUpdates)
    } catch (updateError) {
      console.error(`Error updating block ${item.blockId}:`, updateError)
    }
  }
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
        const analysisPrompt = buildAnalysisPrompt({
          sourceLanguageName: input.journeyLanguageName,
          targetLanguageName: input.textLanguageName,
          journeyTitle: input.name,
          journeyDescription: journey.description,
          seoTitle: journey.seoTitle,
          seoDescription: journey.seoDescription,
          cardBlocksContent
        })

        const { output: analysisResult } = await generateText({
          model: google('gemini-2.5-flash'),
          messages: [
            { role: 'system', content: TRANSLATION_SYSTEM_PROMPT },
            {
              role: 'user',
              content: [{ type: 'text', text: analysisPrompt }]
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

        if (journey.seoTitle && analysisResult.seoTitle) {
          updateData.seoTitle = analysisResult.seoTitle
        }

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
            return translateCardBlocks({
              allBlocks: updatedJourney.blocks,
              cardBlock: cardBlocks[cardIndex],
              journeyId: input.journeyId,
              cardContent,
              journeyAnalysis: analysisResult.analysis,
              sourceLanguageName: input.journeyLanguageName,
              targetLanguageName: input.textLanguageName,
              onBlockUpdated: (blockId, updates) => {
                const idx = updatedJourney.blocks.findIndex(
                  (b) => b.id === blockId
                )
                if (idx !== -1) {
                  updatedJourney.blocks[idx] = {
                    ...updatedJourney.blocks[idx],
                    ...updates
                  }
                }
              }
            }).catch((error) => {
              console.warn(
                `Error translating card ${cardBlocks[cardIndex].id}:`,
                error
              )
            })
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
      // 1. First get the journey details using Prisma
      const journey = await prisma.journey.findUnique({
        where: { id: input.journeyId },
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
          { extensions: { code: 'FORBIDDEN' } }
        )
      }

      // 2. Get the language names
      const sourceLanguageName = input.journeyLanguageName
      const targetLanguageName = input.textLanguageName

      // 3. Get Cards Content
      const cardBlocks = journey.blocks
        .filter((block) => block.typename === 'CardBlock')
        .sort((a, b) => (a.parentOrder ?? 0) - (b.parentOrder ?? 0))

      const cardBlocksContent = await getCardBlocksContent({
        blocks: journey.blocks,
        cardBlocks
      })

      try {
        // 4. Use Gemini to analyze the journey content and get intent, and translate title/description
        const analysisPrompt = buildAnalysisPrompt({
          sourceLanguageName,
          targetLanguageName,
          journeyTitle: input.name,
          journeyDescription: journey.description,
          seoTitle: journey.seoTitle,
          seoDescription: journey.seoDescription,
          cardBlocksContent
        })

        const { output: analysisAndTranslation } = await generateText({
          model: google('gemini-2.5-flash'),
          messages: [
            { role: 'system', content: TRANSLATION_SYSTEM_PROMPT },
            {
              role: 'user',
              content: [{ type: 'text', text: analysisPrompt }]
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
          where: { id: input.journeyId },
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

        // 5. Translate each card (reuses sorted cardBlocks from above)
        await Promise.all(
          cardBlocks.map((cardBlock, i) =>
            translateCardBlocks({
              allBlocks: journey.blocks,
              cardBlock,
              journeyId: input.journeyId,
              cardContent: cardBlocksContent[i],
              journeyAnalysis: analysisAndTranslation.analysis,
              sourceLanguageName,
              targetLanguageName
            }).catch((error) => {
              console.warn(
                `Error translating card ${cardBlock.id}:`,
                error
              )
            })
          )
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
