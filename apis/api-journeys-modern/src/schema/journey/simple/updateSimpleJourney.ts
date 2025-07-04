import { JourneySimple } from '@core/shared/ai/journeySimpleTypes'

import { prisma } from '../../../lib/prisma'

export async function updateSimpleJourney(
  journeyId: string,
  simple: JourneySimple
) {
  // Mark all non-deleted blocks for this journey as deleted
  await prisma.block.updateMany({
    where: { journeyId, deletedAt: null },
    data: { deletedAt: new Date().toISOString() }
  })

  // Update journey title and description
  await prisma.journey.update({
    where: { id: journeyId },
    data: {
      title: simple.title,
      description: simple.description
    }
  })

  // Array of { id: stepBlockId, cardId: cardBlockId }
  const stepBlocks: { id: string; cardId: string }[] = []

  // Grid layout constants
  const CARD_SPACING_X = 400
  const CARD_SPACING_Y = 300

  // 1. Create StepBlocks and CardBlocks
  for (let i = 0; i < simple.cards.length; i++) {
    const row = i % 3
    const col = Math.floor(i / 3)
    const x = col * CARD_SPACING_X
    const y = row * CARD_SPACING_Y

    const stepBlock = await prisma.block.create({
      data: {
        journeyId,
        typename: 'StepBlock',
        parentOrder: i,
        x,
        y
      }
    })

    // Create CardBlock as child of StepBlock
    const cardBlock = await prisma.block.create({
      data: {
        journeyId,
        typename: 'CardBlock',
        parentBlockId: stepBlock.id,
        parentOrder: 0 // always first child
      }
    })

    stepBlocks.push({ id: stepBlock.id, cardId: cardBlock.id })
  }

  // 2. For each card, create content blocks as children of CardBlock
  for (let i = 0; i < simple.cards.length; i++) {
    const card = simple.cards[i]
    const { id: stepBlockId, cardId: cardBlockId } = stepBlocks[i]
    let parentOrder = 0

    if (card.heading) {
      await prisma.block.create({
        data: {
          journeyId,
          typename: 'TypographyBlock',
          parentBlockId: cardBlockId,
          parentOrder: parentOrder++,
          content: card.heading,
          variant: 'h3'
        }
      })
    }

    if (card.text) {
      await prisma.block.create({
        data: {
          journeyId,
          typename: 'TypographyBlock',
          parentBlockId: cardBlockId,
          parentOrder: parentOrder++,
          content: card.text,
          variant: 'body1'
        }
      })
    }

    if (card.image) {
      await prisma.block.create({
        data: {
          journeyId,
          typename: 'ImageBlock',
          parentBlockId: cardBlockId,
          parentOrder: parentOrder++,
          src: card.image.src,
          alt: card.image.alt,
          width: card.image.width ?? 1,
          height: card.image.height ?? 1,
          blurhash: card.image.blurHash ?? ''
        }
      })
    }

    if (card.poll && card.poll.length > 0) {
      const radioQuestion = await prisma.block.create({
        data: {
          journeyId,
          typename: 'RadioQuestionBlock',
          parentBlockId: cardBlockId,
          parentOrder: parentOrder++
        }
      })
      for (let j = 0; j < card.poll.length; j++) {
        const option = card.poll[j]
        await prisma.block.create({
          data: {
            journeyId,
            typename: 'RadioOptionBlock',
            parentBlockId: radioQuestion.id,
            parentOrder: j,
            label: option.text,
            action:
              option.nextCard !== undefined
                ? {
                    create: {
                      blockId: stepBlocks[option.nextCard].id
                    }
                  }
                : undefined
          }
        })
      }
    }

    if (card.button) {
      await prisma.block.create({
        data: {
          journeyId,
          typename: 'ButtonBlock',
          parentBlockId: cardBlockId,
          parentOrder: parentOrder++,
          label: card.button.text,
          action:
            card.button.nextCard !== undefined
              ? {
                  create: {
                    blockId: stepBlocks[card.button.nextCard].id
                  }
                }
              : undefined
        }
      })
    }

    if (card.backgroundImage) {
      const bgImage = await prisma.block.create({
        data: {
          journeyId,
          typename: 'ImageBlock',
          src: card.backgroundImage.src,
          alt: card.backgroundImage.alt,
          parentBlockId: cardBlockId,
          width: card.backgroundImage.width ?? 1,
          height: card.backgroundImage.height ?? 1,
          blurhash: card.backgroundImage.blurHash ?? ''
        }
      })
      await prisma.block.update({
        where: { id: cardBlockId },
        data: { coverBlockId: bgImage.id }
      })
    }

    if (card.nextCard !== undefined) {
      await prisma.block.update({
        where: { id: stepBlockId },
        data: { nextBlockId: stepBlocks[card.nextCard].id }
      })
    }
  }
}
