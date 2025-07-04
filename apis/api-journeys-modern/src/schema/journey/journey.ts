import type { Action, Block, Journey } from '.prisma/api-journeys-modern-client'
import {
  JourneySimpleCard,
  journeySimpleSchema
} from '@core/shared/ai/journeySimpleTypes'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import { Language } from '../language'

// Define JourneyStatus enum to match api-journeys
builder.enumType('JourneyStatus', {
  values: ['archived', 'deleted', 'draft', 'published', 'trashed'] as const
})

export const JourneyRef = builder.prismaObject('Journey', {
  fields: (t) => ({
    id: t.exposeID('id', { shareable: true, nullable: false }),
    title: t.exposeString('title', {
      shareable: true,
      nullable: false,
      description: 'private title for creators'
    }),
    description: t.exposeString('description', {
      nullable: true,
      shareable: true
    }),
    slug: t.exposeString('slug', { shareable: true, nullable: false }),
    createdAt: t.expose('createdAt', {
      type: 'DateTime',
      shareable: true,
      nullable: false
    }),
    updatedAt: t.expose('updatedAt', {
      type: 'DateTime',
      shareable: true,
      nullable: false
    }),
    status: t.field({
      type: 'JourneyStatus',
      nullable: false,
      shareable: true,
      resolve: (journey) => journey.status
    }),
    languageId: t.exposeString('languageId', {
      shareable: true,
      nullable: false
    }),
    language: t.field({
      type: Language,
      shareable: true,
      nullable: false,
      resolve: (journey) => ({ id: journey.languageId ?? '529' })
    }),
    blocks: t.relation('blocks', {
      shareable: true,
      nullable: true
    })
    // Add more fields as needed for federation compatibility
  })
})

// Register as a federated entity
builder.asEntity(JourneyRef, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async (ref) => {
    return prisma.journey.findUnique({
      where: { id: ref.id }
    })
  }
})

// --- JourneySimpleGet Query ---
type BlockWithAction = Block & { action: Action | null }
type JourneyWithBlocks = Journey & { blocks: BlockWithAction[] }

function transformToSimpleJourney(journey: JourneyWithBlocks) {
  // Step 1: Get all StepBlocks (cards)
  const stepBlocks = journey.blocks.filter(
    (block) => block.typename === 'StepBlock'
  )

  // Step 2: For each StepBlock, build a card
  const cards = stepBlocks.map((stepBlock) => {
    // Get all direct children of this step (CardBlock, etc.)
    const childBlocks = journey.blocks.filter(
      (block) => block.parentBlockId === stepBlock.id
    )

    const card: JourneySimpleCard = {}

    // Heading: TypographyBlock, variant: 'h3'
    const headingBlock = childBlocks.find(
      (block) => block.typename === 'TypographyBlock' && block.variant === 'h3'
    )
    if (headingBlock) card.heading = headingBlock.content ?? undefined

    // Text: TypographyBlock, variant: 'body1'
    const textBlock = childBlocks.find(
      (block) =>
        block.typename === 'TypographyBlock' && block.variant === 'body1'
    )
    if (textBlock) card.text = textBlock.content ?? undefined

    // Button: ButtonBlock
    const buttonBlock = childBlocks.find(
      (block) => block.typename === 'ButtonBlock'
    )
    if (buttonBlock) {
      card.button = {
        text: buttonBlock.label ?? '',
        nextCard: buttonBlock.action?.blockId
          ? stepBlocks.findIndex((s) => s.id === buttonBlock.action?.blockId)
          : undefined
      }
    }

    // Poll: RadioQuestionBlock + RadioOptionBlocks
    const pollBlock = childBlocks.find(
      (block) => block.typename === 'RadioQuestionBlock'
    )
    if (pollBlock) {
      const pollOptions = journey.blocks.filter(
        (block) =>
          block.typename === 'RadioOptionBlock' &&
          block.parentBlockId === pollBlock.id
      )
      card.poll = pollOptions.map((option) => ({
        text: option.label ?? '',
        nextCard: option.action?.blockId
          ? stepBlocks.findIndex((s) => s.id === option.action?.blockId)
          : undefined
      }))
    }

    // Image: ImageBlock
    const imageBlock = childBlocks.find(
      (block) =>
        block.typename === 'ImageBlock' && block.id != stepBlock.coverBlockId
    )
    if (imageBlock) card.image = imageBlock.src ?? undefined

    // Background Image: coverBlockId on StepBlock
    if (stepBlock.coverBlockId) {
      const bgImageBlock = journey.blocks.find(
        (block) => block.id === stepBlock.coverBlockId
      )
      if (bgImageBlock && bgImageBlock.typename === 'ImageBlock') {
        card.backgroundImage = bgImageBlock.src ?? undefined
      }
    }

    // Next Card: nextBlockId on StepBlock
    if (stepBlock.nextBlockId) {
      card.nextCard = stepBlocks.findIndex(
        (s) => s.id === stepBlock.nextBlockId
      )
    }

    return card
  })

  return {
    title: journey.title,
    description: journey.description ?? '',
    cards
  }
}

builder.queryField('journeySimpleGet', (t) =>
  t.field({
    type: 'Json',
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, { id }) => {
      // Fetch journey and all blocks with actions
      const journey = await prisma.journey.findUnique({
        where: { id },
        include: {
          blocks: {
            where: { deletedAt: null },
            include: { action: true }
          }
        }
      })
      if (!journey) throw new Error('Journey not found')

      // Transform to simplified structure
      const simpleJourney = transformToSimpleJourney(journey)

      // Validate with Zod
      const result = journeySimpleSchema.safeParse(simpleJourney)
      if (!result.success) {
        throw new Error(
          'Transformed journey data is invalid: ' +
            JSON.stringify(result.error.format())
        )
      }
      return result.data
    }
  })
)
