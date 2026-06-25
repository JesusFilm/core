import { Output, streamText } from 'ai'
import { GraphQLError } from 'graphql'
import { z } from 'zod'

import { Block, prisma } from '@core/prisma/journeys/client'
import {
  AiRequestTimeoutError,
  createOpenrouterFallbackSession
} from '@core/shared/ai/openrouterModel'
import { hardenPrompt } from '@core/shared/ai/prompts'

import { env } from '../../env'
import { Action, ability, subject } from '../../lib/auth/ability'
import { logger } from '../../logger'
import { builder } from '../builder'
import { JourneyRef } from '../journey/journey'

import {
  createTranslationInfo,
  getTranslatableFields
} from './blockTranslation'
import { getCardBlocksContent } from './getCardBlocksContent'
import { translateCustomizationFields } from './translateCustomizationFields'
import {
  TRANSLATION_SYSTEM_PROMPT,
  translateJourneyMetadata
} from './translateJourneyMetadata/translateJourneyMetadata'

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
const BlockTranslationUpdatesSchema = z
  .object({
    content: z.string().optional(),
    label: z.string().optional(),
    placeholder: z.string().optional(),
    hint: z.string().optional(),
    submitLabel: z.string().optional()
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
  TextResponseBlock: ['label', 'placeholder', 'hint'],
  SignUpBlock: ['submitLabel']
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

// The model is asked to echo back one structured-output entry per block it is
// given. It probabilistically omits some, so we re-request only the blocks that
// were not translated, up to this many total attempts per card.
const MAX_CARD_TRANSLATION_ATTEMPTS = 3

interface TranslateBlocksArgs {
  blocksToTranslate: Block[]
  allBlocks: Block[]
  cardBlockId: string
  journeyId: string
  cardContent: string
  journeyAnalysis: string
  sourceLanguageName: string
  targetLanguageName: string
  onBlockUpdated?: (
    blockId: string,
    updates: Partial<Record<TranslatableBlockField, string>>
  ) => void
  session: ReturnType<typeof createOpenrouterFallbackSession>
}

/**
 * Streams translations for a specific set of blocks and writes each validated
 * result to the database. Returns the IDs of the blocks that were actually
 * translated so the caller can re-request the ones the model omitted.
 *
 * Never throws — a failed attempt resolves to whatever it managed to translate,
 * leaving the rest for the caller's retry loop.
 */
async function translateBlocksOnce({
  blocksToTranslate,
  allBlocks,
  cardBlockId,
  journeyId,
  cardContent,
  journeyAnalysis,
  sourceLanguageName,
  targetLanguageName,
  onBlockUpdated,
  session
}: TranslateBlocksArgs): Promise<Set<string>> {
  const allowedBlockIds = new Set(blocksToTranslate.map((b) => b.id))
  const updatedBlockIds = new Set<string>()
  const blocksInfo = blocksToTranslate
    .map((block) => createTranslationInfo(block))
    .join('\n')

  const prompt = `Context from journey analysis:
${hardenPrompt(journeyAnalysis)}

Translate from ${hardenPrompt(sourceLanguageName)} to ${hardenPrompt(targetLanguageName)}.

Card context:
${hardenPrompt(cardContent)}

Blocks to translate (use the EXACT IDs shown in square brackets as blockId):
${hardenPrompt(blocksInfo)}

Return exactly one entry for every block ID listed above — do not skip, merge, or invent blocks. If a block does not need changes, still return it with its text translated.`

  try {
    await session.execute(async (model, abortSignal) => {
      let streamError: unknown
      const { elementStream } = streamText({
        model,
        abortSignal,
        maxRetries: 0,
        messages: [
          { role: 'system', content: TRANSLATION_SYSTEM_PROMPT },
          {
            role: 'user',
            content: [{ type: 'text', text: prompt }]
          }
        ],
        output: Output.array({ element: BlockTranslationSchema }),
        onError: ({ error }) => {
          streamError = error
          logger.warn(
            { error, cardBlockId },
            'Error in translation stream for card'
          )
        }
      })

      for await (const item of elementStream) {
        try {
          const cleanBlockId = item.blockId.replace(/^\[|\]$/g, '')

          if (!allowedBlockIds.has(cleanBlockId)) continue
          if (updatedBlockIds.has(cleanBlockId)) continue

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

          updatedBlockIds.add(cleanBlockId)
          onBlockUpdated?.(cleanBlockId, validatedUpdates)
        } catch (updateError) {
          logger.error(
            { error: updateError, blockId: item.blockId },
            'Error updating block'
          )
        }
      }

      // The AI SDK reports stream failures to onError and ends the stream
      // instead of throwing, which silently truncates the array. Re-throw so a
      // fallback-eligible error (timeout/429/403) advances the session to the
      // next model. Only escalate while blocks remain untranslated — a late
      // error after every block landed is not worth a fallback round-trip.
      if (streamError != null && updatedBlockIds.size < allowedBlockIds.size) {
        throw streamError
      }
    })
  } catch (error) {
    logger.warn({ error, cardBlockId }, 'Card translation attempt failed')
  }

  return updatedBlockIds
}

async function translateCardBlocks({
  allBlocks,
  cardBlock,
  journeyId,
  cardContent,
  journeyAnalysis,
  sourceLanguageName,
  targetLanguageName,
  onBlockUpdated,
  session
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
  session: ReturnType<typeof createOpenrouterFallbackSession>
}): Promise<void> {
  const blocksToTranslate = getTranslatableBlocksForCard(allBlocks, cardBlock)
  if (blocksToTranslate.length === 0) return

  const blocksById = new Map(blocksToTranslate.map((b) => [b.id, b]))
  const pendingBlockIds = new Set(blocksById.keys())

  for (
    let attempt = 1;
    attempt <= MAX_CARD_TRANSLATION_ATTEMPTS && pendingBlockIds.size > 0;
    attempt++
  ) {
    const pendingBlocks = Array.from(pendingBlockIds, (id) =>
      blocksById.get(id)
    ).filter((block): block is Block => block != null)

    const updatedBlockIds = await translateBlocksOnce({
      blocksToTranslate: pendingBlocks,
      allBlocks,
      cardBlockId: cardBlock.id,
      journeyId,
      cardContent,
      journeyAnalysis,
      sourceLanguageName,
      targetLanguageName,
      onBlockUpdated,
      session
    })

    for (const id of updatedBlockIds) pendingBlockIds.delete(id)
  }

  if (pendingBlockIds.size > 0) {
    logger.warn(
      {
        cardBlockId: cardBlock.id,
        missingBlockIds: Array.from(pendingBlockIds)
      },
      'Card translation incomplete: some blocks were not translated after retries'
    )
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
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
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

        const session = createOpenrouterFallbackSession(
          env.TRANSLATION_AI_MODELS
        )

        // Step 1: Analyze the journey, then translate the title, description,
        // and SEO fields each in their own single-field call so the model
        // cannot swap one field's value into another field's slot.
        const analysisResult = await translateJourneyMetadata({
          sourceLanguageName: input.journeyLanguageName,
          targetLanguageName: input.textLanguageName,
          journeyTitle: input.name,
          journeyDisplayTitle: journey.displayTitle,
          journeyDescription: journey.description,
          seoTitle: journey.seoTitle,
          seoDescription: journey.seoDescription,
          cardBlocksContent,
          session
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

        const descriptionLanguageName =
          input.userLanguageName ?? input.textLanguageName

        // Translate customization fields and description
        const customizationTranslation = await translateCustomizationFields({
          journeyCustomizationDescription:
            journey.journeyCustomizationDescription,
          journeyCustomizationFields: journey.journeyCustomizationFields,
          sourceLanguageName: input.journeyLanguageName,
          targetLanguageName: input.textLanguageName,
          descriptionTargetLanguageName: descriptionLanguageName,
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
          displayTitle?: string
          description?: string
          seoTitle?: string
          seoDescription?: string
          journeyCustomizationDescription?: string
        } = {
          title: analysisResult.title,
          languageId: input.textLanguageId
        }

        if (journey.displayTitle && analysisResult.displayTitle) {
          updateData.displayTitle = analysisResult.displayTitle
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
              },
              session
            }).catch((error) => {
              logger.warn(
                { error, cardBlockId: cardBlocks[cardIndex].id },
                'Error translating card'
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
        logger.error({ error }, 'Translation error')
        // Rethrow as a GraphQLError so the client subscription terminates with
        // an error (firing the frontend `onError`) instead of completing
        // normally. A normal completion would silently close the dialog with
        // no error surfaced. GraphQLErrors are not masked by the Yoga server,
        // so the message reaches the client.
        if (error instanceof GraphQLError) throw error
        if (error instanceof AiRequestTimeoutError) {
          throw new GraphQLError(
            'Translation timed out while contacting the AI service. Please try again.'
          )
        }
        // Keep unknown errors generic — the original error is logged above, so
        // we avoid leaking provider/SDK internals to the client.
        throw new GraphQLError('Translation failed')
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

      const session = createOpenrouterFallbackSession(env.TRANSLATION_AI_MODELS)

      try {
        // 4. Analyze the journey, then translate the title, description, and
        // SEO fields each in their own single-field call so the model cannot
        // swap one field's value into another field's slot.
        const analysisAndTranslation = await translateJourneyMetadata({
          sourceLanguageName,
          targetLanguageName,
          journeyTitle: input.name,
          journeyDisplayTitle: journey.displayTitle,
          journeyDescription: journey.description,
          seoTitle: journey.seoTitle,
          seoDescription: journey.seoDescription,
          cardBlocksContent,
          session
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

        const descriptionLanguageName =
          input.userLanguageName ?? input.textLanguageName

        // Translate customization fields and description
        const customizationTranslation = await translateCustomizationFields({
          journeyCustomizationDescription:
            journey.journeyCustomizationDescription,
          journeyCustomizationFields: journey.journeyCustomizationFields,
          sourceLanguageName: input.journeyLanguageName,
          targetLanguageName: input.textLanguageName,
          descriptionTargetLanguageName: descriptionLanguageName,
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
            // Only update displayTitle if the original journey had one
            ...(journey.displayTitle
              ? { displayTitle: analysisAndTranslation.displayTitle }
              : {}),
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
              targetLanguageName,
              session
            }).catch((error) => {
              logger.warn(
                { error, cardBlockId: cardBlock.id },
                'Error translating card'
              )
            })
          )
        )
      } catch (error: unknown) {
        logger.error({ error }, 'Error analyzing journey with Gemini')
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
