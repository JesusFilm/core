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
  MultiselectOptionBlock: ['label'],
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

  // Option blocks are grandchildren of the card: RadioOptionBlocks hang off a
  // RadioQuestionBlock and MultiselectOptionBlocks hang off a MultiselectBlock,
  // both of which are direct card children. Collect them so their labels are
  // translated too.
  const nestedOptionBlocks = cardChildren.flatMap((child) =>
    allBlocks.filter(
      (block) =>
        block.parentBlockId === child.id &&
        (block.typename === 'RadioOptionBlock' ||
          block.typename === 'MultiselectOptionBlock')
    )
  )

  return [...cardChildren, ...nestedOptionBlocks].filter((block) => {
    const fields = getTranslatableFields(block)
    return Object.values(fields).some((v) => v != null && v !== '')
  })
}

// Per-card translation is resilient to the model omitting whole blocks OR
// individual fields from its structured output. We make a few batched passes
// re-requesting only the still-missing fields, then escalate any stubborn block
// to its own isolated request — a one-block request cannot be dropped off the
// tail of a long array or merged into a sibling's entry.
const MAX_CARD_BATCH_ATTEMPTS = 3
const MAX_PER_BLOCK_ATTEMPTS = 2

interface BlockTranslationRequest {
  block: Block
  fields: TranslatableBlockField[]
}

interface TranslateBlocksArgs {
  requests: BlockTranslationRequest[]
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
 * The translatable fields of a block that actually carry a source value,
 * restricted to the fields allowed for that block type. These are the fields a
 * complete translation must cover.
 */
function getRequiredFields(block: Block): TranslatableBlockField[] {
  const allowedFields =
    allowedTranslationFieldsByBlockType[
      block.typename as keyof typeof allowedTranslationFieldsByBlockType
    ]
  if (allowedFields == null) return []

  const fields = getTranslatableFields(block)
  return allowedFields.filter((field) => {
    const value = fields[field]
    return value != null && value !== ''
  })
}

/**
 * Streams translations for a specific set of (block, fields) requests and writes
 * each validated result to the database. Returns, per block, the set of fields
 * that were actually written this pass so the caller can re-request the rest.
 *
 * Always resolves (never rejects) — although a fallback-eligible stream error is
 * re-thrown internally to advance the session to the next model, the outer
 * try/catch absorbs it, so a failed attempt resolves to whatever it managed to
 * translate and leaves the rest for the caller's retry loop.
 */
async function translateBlocksOnce({
  requests,
  allBlocks,
  cardBlockId,
  journeyId,
  cardContent,
  journeyAnalysis,
  sourceLanguageName,
  targetLanguageName,
  onBlockUpdated,
  session
}: TranslateBlocksArgs): Promise<Map<string, Set<TranslatableBlockField>>> {
  const requestedFieldsByBlock = new Map(
    requests.map((request) => [
      request.block.id,
      new Set<TranslatableBlockField>(request.fields)
    ])
  )
  const writtenFields = new Map<string, Set<TranslatableBlockField>>()
  const totalRequested = requests.reduce(
    (sum, request) => sum + request.fields.length,
    0
  )
  let totalWritten = 0

  if (totalRequested === 0) return writtenFields

  const blocksInfo = requests
    .map((request) => createTranslationInfo(request.block, request.fields))
    .join('\n')

  const prompt = `Context from journey analysis:
${hardenPrompt(journeyAnalysis)}

Translate from ${hardenPrompt(sourceLanguageName)} to ${hardenPrompt(targetLanguageName)}.

Card context:
${hardenPrompt(cardContent)}

Blocks to translate (use the EXACT IDs shown in square brackets as blockId):
${hardenPrompt(blocksInfo)}

Return exactly one entry for every block ID listed above, and translate every field shown for it — do not skip, merge, or invent blocks or fields.`

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

          const requestedFields = requestedFieldsByBlock.get(cleanBlockId)
          if (requestedFields == null) continue

          const blockToUpdate = allBlocks.find((b) => b.id === cleanBlockId)
          if (blockToUpdate == null) continue

          const validatedUpdates = getValidatedBlockUpdates(
            blockToUpdate,
            item.updates
          )
          if (validatedUpdates == null) continue

          // Only write fields we asked for this pass and have not already
          // written, so a later retry can't overwrite an earlier field's value.
          const alreadyWritten =
            writtenFields.get(cleanBlockId) ??
            new Set<TranslatableBlockField>()
          const updates = Object.fromEntries(
            Object.entries(validatedUpdates).filter(
              ([field]) =>
                requestedFields.has(field as TranslatableBlockField) &&
                !alreadyWritten.has(field as TranslatableBlockField)
            )
          ) as Partial<Record<TranslatableBlockField, string>>

          if (Object.keys(updates).length === 0) continue

          await prisma.block.update({
            where: { id: cleanBlockId, journeyId },
            data: updates
          })

          for (const field of Object.keys(updates) as TranslatableBlockField[]) {
            alreadyWritten.add(field)
          }
          writtenFields.set(cleanBlockId, alreadyWritten)
          totalWritten += Object.keys(updates).length

          onBlockUpdated?.(cleanBlockId, updates)
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
      // next model. Only escalate while fields remain untranslated — a late
      // error after everything landed is not worth a fallback round-trip.
      if (streamError != null && totalWritten < totalRequested) {
        throw streamError
      }
    })
  } catch (error) {
    logger.warn({ error, cardBlockId }, 'Card translation attempt failed')
  }

  return writtenFields
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
  const requiredFieldsByBlock = new Map(
    blocksToTranslate.map((b) => [b.id, getRequiredFields(b)])
  )
  const translatedFieldsByBlock = new Map<string, Set<TranslatableBlockField>>(
    blocksToTranslate.map((b) => [b.id, new Set()])
  )

  const missingFieldsFor = (blockId: string): TranslatableBlockField[] => {
    const required = requiredFieldsByBlock.get(blockId) ?? []
    const done = translatedFieldsByBlock.get(blockId) ?? new Set()
    return required.filter((field) => !done.has(field))
  }

  const incompleteBlockIds = (): string[] =>
    Array.from(blocksById.keys()).filter(
      (id) => missingFieldsFor(id).length > 0
    )

  const recordWritten = (
    written: Map<string, Set<TranslatableBlockField>>
  ): void => {
    for (const [blockId, fields] of written) {
      const done = translatedFieldsByBlock.get(blockId)
      if (done == null) continue
      for (const field of fields) done.add(field)
    }
  }

  const translate = (
    blockIds: string[]
  ): Promise<Map<string, Set<TranslatableBlockField>>> => {
    const requests = blockIds
      .map((id) => ({ block: blocksById.get(id), fields: missingFieldsFor(id) }))
      .filter(
        (request): request is BlockTranslationRequest =>
          request.block != null && request.fields.length > 0
      )

    return translateBlocksOnce({
      requests,
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
  }

  // Phase 1: batched passes — one request covering every still-missing field
  // across the card. Handles the common case cheaply.
  for (
    let attempt = 1;
    attempt <= MAX_CARD_BATCH_ATTEMPTS && incompleteBlockIds().length > 0;
    attempt++
  ) {
    recordWritten(await translate(incompleteBlockIds()))
  }

  // Phase 2: per-block escalation — translate each stubborn block on its own,
  // requesting only the fields still missing.
  const stubbornBlockIds = incompleteBlockIds()
  if (stubbornBlockIds.length > 0) {
    await Promise.all(
      stubbornBlockIds.map(async (blockId) => {
        for (
          let attempt = 1;
          attempt <= MAX_PER_BLOCK_ATTEMPTS &&
          missingFieldsFor(blockId).length > 0;
          attempt++
        ) {
          recordWritten(await translate([blockId]))
        }
      })
    )
  }

  const stillMissing = incompleteBlockIds()
  if (stillMissing.length > 0) {
    logger.warn(
      {
        cardBlockId: cardBlock.id,
        missing: stillMissing.map((id) => ({
          blockId: id,
          fields: missingFieldsFor(id)
        }))
      },
      'Card translation incomplete: some block fields were not translated after retries and escalation'
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
            // Only update displayTitle if the original journey had one and a
            // non-empty translation came back, so an omitted translation never
            // clears an existing displayTitle (matches the subscription path).
            ...(journey.displayTitle && analysisAndTranslation.displayTitle
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
