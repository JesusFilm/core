import type { Prisma } from '.prisma/api-journeys-modern-client'
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

  const cards = stepBlocks.map((stepBlock, index) => {
    const cardBlock = journey.blocks.filter(
      (block) => block.parentBlockId === stepBlock.id
    )[0]
    if (!cardBlock) throw new Error('Card block not found')

    const childBlocks = journey.blocks.filter(
      (block) => block.parentBlockId === cardBlock.id
    )

    const card: JourneySimpleCard = {
      id: `card-${index + 1}`
    }

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
      const nextStepBlockIndex = buttonBlock.action?.blockId
        ? stepBlocks.findIndex((s) => s.id === buttonBlock.action?.blockId)
        : -1
      card.button = {
        text: buttonBlock.label ?? '',
        nextCard:
          nextStepBlockIndex >= 0
            ? `card-${nextStepBlockIndex + 1}`
            : undefined,
        url: buttonBlock.action?.url ?? undefined
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
      card.poll = pollOptions.map((option) => {
        const nextStepBlockIndex = option.action?.blockId
          ? stepBlocks.findIndex((s) => s.id === option.action?.blockId)
          : -1
        return {
          text: option.label ?? '',
          nextCard:
            nextStepBlockIndex >= 0
              ? `card-${nextStepBlockIndex + 1}`
              : undefined,
          url: option.action?.url ?? undefined
        }
      })
    }

    const imageBlock = childBlocks.find(
      (block) =>
        block.typename === 'ImageBlock' && block.id != cardBlock.coverBlockId
    )
    if (imageBlock) {
      card.image = {
        src: imageBlock.src ?? '',
        alt: imageBlock.alt ?? '',
        width: imageBlock.width ?? 0,
        height: imageBlock.height ?? 0,
        blurhash: imageBlock.blurhash ?? ''
      }
    }

    if (cardBlock.coverBlockId) {
      const bgImageBlock = journey.blocks.find(
        (block) => block.id === cardBlock.coverBlockId
      )
      if (bgImageBlock && bgImageBlock.typename === 'ImageBlock') {
        card.backgroundImage = {
          src: bgImageBlock.src ?? '',
          alt: bgImageBlock.alt ?? '',
          width: bgImageBlock.width ?? 0,
          height: bgImageBlock.height ?? 0,
          blurhash: bgImageBlock.blurhash ?? ''
        }
      }
    }

    if (stepBlock.nextBlockId) {
      const nextStepBlockIndex = stepBlocks.findIndex(
        (s) => s.id === stepBlock.nextBlockId
      )
      if (nextStepBlockIndex >= 0) {
        card.defaultNextCard = `card-${nextStepBlockIndex + 1}`
      }
    }

    return card
  })

  return {
    title: journey.title,
    description: journey.description ?? '',
    cards
  }
}
