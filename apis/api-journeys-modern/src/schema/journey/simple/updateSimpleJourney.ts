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

  const stepBlockIds: string[] = []

  for (let i = 0; i < simple.cards.length; i++) {
    const stepBlock = await prisma.block.create({
      data: {
        journeyId,
        typename: 'StepBlock',
        parentOrder: i
      }
    })
    stepBlockIds.push(stepBlock.id)
  }

  for (let i = 0; i < simple.cards.length; i++) {
    const card = simple.cards[i]
    const stepBlockId = stepBlockIds[i]
    let parentOrder = 0

    if (card.heading) {
      await prisma.block.create({
        data: {
          journeyId,
          typename: 'TypographyBlock',
          parentBlockId: stepBlockId,
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
          parentBlockId: stepBlockId,
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
          parentBlockId: stepBlockId,
          parentOrder: parentOrder++,
          src: card.image
        }
      })
    }

    if (card.poll && card.poll.length > 0) {
      const radioQuestion = await prisma.block.create({
        data: {
          journeyId,
          typename: 'RadioQuestionBlock',
          parentBlockId: stepBlockId,
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
                      blockId: stepBlockIds[option.nextCard]
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
          parentBlockId: stepBlockId,
          parentOrder: parentOrder++,
          label: card.button.text,
          action:
            card.button.nextCard !== undefined
              ? {
                  create: {
                    blockId: stepBlockIds[card.button.nextCard]
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
          src: card.backgroundImage
        }
      })
      await prisma.block.update({
        where: { id: stepBlockId },
        data: { coverBlockId: bgImage.id }
      })
    }

    if (card.nextCard !== undefined) {
      await prisma.block.update({
        where: { id: stepBlockId },
        data: { nextBlockId: stepBlockIds[card.nextCard] }
      })
    }
  }
}
