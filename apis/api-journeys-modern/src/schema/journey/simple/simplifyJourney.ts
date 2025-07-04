import { Prisma } from '.prisma/api-journeys-modern-client'
import {
  JourneySimple,
  JourneySimpleCard
} from '@core/shared/ai/journeySimpleTypes'

export function simplifyJourney(
  journey: Prisma.JourneyGetPayload<{
    include: { blocks: { include: { action: true } } }
  }>
): JourneySimple {
  const stepBlocks = journey.blocks.filter(
    (block) => block.typename === 'StepBlock'
  )

  const cards = stepBlocks.map((stepBlock) => {
    const childBlocks = journey.blocks.filter(
      (block) => block.parentBlockId === stepBlock.id
    )

    const card: JourneySimpleCard = {}

    const headingBlock = childBlocks.find(
      (block) => block.typename === 'TypographyBlock' && block.variant === 'h3'
    )
    if (headingBlock) card.heading = headingBlock.content ?? undefined

    const textBlock = childBlocks.find(
      (block) =>
        block.typename === 'TypographyBlock' && block.variant === 'body1'
    )
    if (textBlock) card.text = textBlock.content ?? undefined

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

    const imageBlock = childBlocks.find(
      (block) =>
        block.typename === 'ImageBlock' && block.id != stepBlock.coverBlockId
    )
    if (imageBlock) card.image = imageBlock.src ?? undefined

    if (stepBlock.coverBlockId) {
      const bgImageBlock = journey.blocks.find(
        (block) => block.id === stepBlock.coverBlockId
      )
      if (bgImageBlock && bgImageBlock.typename === 'ImageBlock') {
        card.backgroundImage = bgImageBlock.src ?? undefined
      }
    }

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
