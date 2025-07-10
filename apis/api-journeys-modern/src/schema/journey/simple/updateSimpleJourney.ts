import fetch from 'node-fetch'

import { JourneySimple } from '@core/shared/ai/journeySimpleTypes'

import { prisma } from '../../../lib/prisma'

// extract youtube video id from url
function extractYouTubeVideoId(input: string): string | null {
  // If input is already an 11-char video ID, return as-is
  if (/^[\w-]{11}$/.test(input)) return input
  // Otherwise, try to extract from URL
  const match = input.match(
    /(?:v=|vi=|youtu\.be\/|\/v\/|embed\/|shorts\/|\/watch\?v=|\/watch\?.+&v=)([\w-]{11})/
  )
  if (match) return match[1]
  // Fallback: try generic 11-char match
  const generic = input.match(/([\w-]{11})/)
  return generic ? generic[1] : null
}

// parse iso8601 duration function
function parseISO8601Duration(duration: string): number {
  const match = duration.match(/P(\d+Y)?(\d+W)?(\d+D)?T(\d+H)?(\d+M)?(\d+S)?/)
  if (match == null) return 0
  const [years, weeks, days, hours, minutes, seconds] = match
    .slice(1)
    .map((period) =>
      period != null ? Number.parseInt(period.replace(/\D/, '')) : 0
    )
  return (
    (((years * 365 + weeks * 7 + days) * 24 + hours) * 60 + minutes) * 60 +
    seconds
  )
}

// get youtube video duration
async function getYouTubeVideoDuration(videoId: string): Promise<number> {
  const videosQuery = new URLSearchParams({
    part: 'contentDetails',
    key: process.env.FIREBASE_API_KEY ?? '',
    id: videoId
  }).toString()
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?${videosQuery}`
  )
  const data = await response.json()
  console.log(data)
  const isoDuration = data.items?.[0]?.contentDetails?.duration
  if (!isoDuration) throw new Error('Could not fetch video duration')
  return parseISO8601Duration(isoDuration)
}

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

    stepBlocks.push({
      stepBlockId: stepBlock.id,
      cardBlockId: cardBlock.id,
      simpleCardId: simpleCard.id
    })
  }

  // 2. For each card, create content blocks as children of CardBlock
  for (const card of simple.cards) {
    const { stepBlockId, cardBlockId } = stepBlocks.find(
      (s) => s.simpleCardId === card.id
    )!
    let parentOrder = 0

    // if video, create video card
    if (card.video != null) {
      const nextStepBlock =
        card.defaultNextCard != null
          ? stepBlocks.find((s) => s.simpleCardId === card.defaultNextCard)
          : undefined
      const videoId = extractYouTubeVideoId(card.video.url)
      if (videoId == null) {
        throw new Error('Invalid YouTube video URL')
      }
      const videoDuration = await getYouTubeVideoDuration(videoId)
      await prisma.block.create({
        data: {
          journeyId,
          typename: 'VideoBlock',
          parentBlockId: cardBlockId,
          parentOrder: parentOrder++,
          videoId,
          source: 'youTube',
          startAt: card.video.startAt ?? 0,
          endAt: card.video.endAt ?? videoDuration,
          action:
            nextStepBlock != null
              ? {
                  create: {
                    blockId: nextStepBlock.stepBlockId
                  }
                }
              : undefined
        }
      })
    } else {
      // if not video, create other card content
      if (card.heading != null) {
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

      if (card.text != null) {
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

      if (card.image != null) {
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
            blurhash: card.image.blurhash ?? ''
          }
        })
      }

      if (card.poll != null && card.poll.length > 0) {
        const radioQuestion = await prisma.block.create({
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
          await prisma.block.create({
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
        await prisma.block.create({
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
        const bgImage = await prisma.block.create({
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
        await prisma.block.update({
          where: { id: cardBlockId },
          data: { coverBlockId: bgImage.id }
        })
      }
    }

    // Set default next card
    if (card.defaultNextCard != null) {
      const nextStepBlock =
        card.defaultNextCard != null
          ? stepBlocks.find((s) => s.simpleCardId === card.defaultNextCard)
          : undefined
      if (nextStepBlock != null) {
        await prisma.block.update({
          where: { id: stepBlockId },
          data: { nextBlockId: nextStepBlock.stepBlockId }
        })
      }
    }
  }
}
