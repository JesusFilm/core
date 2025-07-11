import { JourneySimpleUpdate } from '@core/shared/ai/journeySimpleTypes'

import { prisma } from '../../../lib/prisma'

export async function updateSimpleJourney(
  journeyId: string,
  simple: JourneySimpleUpdate
) {
  return prisma.$transaction(async (tx) => {
    // Mark all non-deleted blocks for this journey as deleted
    await tx.block.updateMany({
      where: { journeyId, deletedAt: null },
      data: { deletedAt: new Date().toISOString() }
    })

    // Update journey title and description
    await tx.journey.update({
      where: { id: journeyId },
      data: {
        title: simple.title,
        description: simple.description
      }
    })

    // Array of { id: stepBlockId, cardId: cardBlockId }
    const stepBlocks: {
      stepBlockId: string
      cardBlockId: string
      simpleCardId: string
    }[] = []

    // Grid layout constants
    const CARD_SPACING_X = 400
    const CARD_SPACING_Y = 300

    // 1. Create StepBlocks and CardBlocks
    for (const [i, simpleCard] of simple.cards.entries()) {
      const row = i % 3
      const col = Math.floor(i / 3)
      const x = col * CARD_SPACING_X
      const y = row * CARD_SPACING_Y

      const stepBlock = await tx.block.create({
        data: {
          journeyId,
          typename: 'StepBlock',
          parentOrder: i,
          x,
          y
        }
      })

      // Create CardBlock as child of StepBlock
      const cardBlock = await tx.block.create({
        data: {
          journeyId,
          typename: 'CardBlock',
          parentBlockId: stepBlock.id,
          parentOrder: 0 // always first child
        }
      })

      stepBlocks.push({
        stepBlockId: stepBlock.id,
        cardBlockId: cardBlock.id,
        simpleCardId: simpleCard.id
      })
    }

    // 2. For each card, create content blocks as children of CardBlock
    for (const card of simple.cards) {
      const stepBlockEntry = stepBlocks.find((s) => s.simpleCardId === card.id)
      if (!stepBlockEntry) {
        // No matching step block found for this card, skip to next card
        continue
      }
      const { stepBlockId, cardBlockId } = stepBlockEntry
      let parentOrder = 0

      if (card.heading != null) {
        await tx.block.create({
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

      if (card.text != null) {
        await tx.block.create({
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

      if (card.image != null) {
        await tx.block.create({
          data: {
            journeyId,
            typename: 'ImageBlock',
            parentBlockId: cardBlockId,
            parentOrder: parentOrder++,
            src: card.image.src,
            alt: card.image.alt,
            width: card.image.width ?? 1,
            height: card.image.height ?? 1,
            blurhash: card.image.blurhash ?? ''
          }
        })
      }

      if (card.poll != null && card.poll.length > 0) {
        const radioQuestion = await tx.block.create({
          data: {
            journeyId,
            typename: 'RadioQuestionBlock',
            parentBlockId: cardBlockId,
            parentOrder: parentOrder++
          }
        })
        for (const [j, option] of card.poll.entries()) {
          const nextStepBlock =
            option.nextCard != null
              ? stepBlocks.find((s) => s.simpleCardId === option.nextCard)
              : undefined
          await tx.block.create({
            data: {
              journeyId,
              typename: 'RadioOptionBlock',
              parentBlockId: radioQuestion.id,
              parentOrder: j,
              label: option.text,
              action:
                nextStepBlock != null
                  ? {
                      create: {
                        blockId: nextStepBlock.stepBlockId
                      }
                    }
                  : option.url
                    ? { create: { url: option.url } }
                    : undefined
            }
          })
        }
      }

      if (card.button != null) {
        const nextStepBlock =
          card.button.nextCard != null
            ? stepBlocks.find((s) => s.simpleCardId === card.button?.nextCard)
            : undefined
        await tx.block.create({
          data: {
            journeyId,
            typename: 'ButtonBlock',
            parentBlockId: cardBlockId,
            parentOrder: parentOrder++,
            label: card.button.text,
            action:
              nextStepBlock != null
                ? {
                    create: {
                      blockId: nextStepBlock.stepBlockId
                    }
                  }
                : card.button.url
                  ? { create: { url: card.button.url } }
                  : undefined
          }
        })
      }

      if (card.backgroundImage != null) {
        const bgImage = await tx.block.create({
          data: {
            journeyId,
            typename: 'ImageBlock',
            src: card.backgroundImage.src,
            alt: card.backgroundImage.alt,
            parentBlockId: cardBlockId,
            width: card.backgroundImage.width ?? 1,
            height: card.backgroundImage.height ?? 1,
            blurhash: card.backgroundImage.blurhash ?? ''
          }
        })
        await tx.block.update({
          where: { id: cardBlockId },
          data: { coverBlockId: bgImage.id }
        })
      }

      if (card.video != null) {
        // Extract videoId from YouTube URL
        // Expected format: https://youtube.com/watch?v=VIDEO_ID
        const urlParams = new URLSearchParams(new URL(card.video.url).search)
        const videoId = urlParams.get('v')

        if (videoId) {
          await tx.block.create({
            data: {
              journeyId,
              typename: 'VideoBlock',
              parentBlockId: cardBlockId,
              parentOrder: parentOrder++,
              source: 'youTube',
              videoId,
              startAt: card.video.startAt ?? null,
              endAt: card.video.endAt ?? null
            }
          })
        }
      }

      if (card.defaultNextCard != null) {
        const nextStepBlock =
          card.defaultNextCard != null
            ? stepBlocks.find((s) => s.simpleCardId === card.defaultNextCard)
            : undefined
        if (nextStepBlock != null) {
          await tx.block.update({
            where: { id: stepBlockId },
            data: { nextBlockId: nextStepBlock.stepBlockId }
          })
        }
      }
    }
  })
}
