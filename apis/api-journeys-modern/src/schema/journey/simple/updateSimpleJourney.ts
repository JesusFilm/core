import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { graphql } from 'gql.tada'
import fetch from 'node-fetch'

import {
  JourneySimpleImage,
  JourneySimpleUpdate
} from '@core/shared/ai/journeySimpleTypes'

import { prisma } from '../../../lib/prisma'
import { generateBlurhashAndMetadataFromUrl } from '../../../utils/generateBlurhashAndMetadataFromUrl'

const ALLOWED_IMAGE_HOSTNAMES = [
  // matches jourenys-admin next.config.js
  'localhost',
  'unsplash.com',
  'images.unsplash.com',
  'imagizer.imageshack.com',
  'i.ytimg.com',
  'd1wl257kev7hsz.cloudfront.net',
  'imagedelivery.net',
  'image.mux.com'
]

const isValidImageUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()
    // Check protocol
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:')
      return false
    // Check hostname (allow subdomains)
    return ALLOWED_IMAGE_HOSTNAMES.some(
      (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`)
    )
  } catch {
    // Not a valid URL
    return false
  }
}

const httpLink = createHttpLink({
  uri: process.env.GATEWAY_URL,
  headers: {
    'interop-token': process.env.INTEROP_TOKEN ?? '',
    'x-graphql-client-name': 'api-journeys-modern',
    'x-graphql-client-version': process.env.SERVICE_VERSION ?? ''
  }
})

const apollo = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
})

const CREATE_CLOUDFLARE_IMAGE = graphql(`
  mutation CreateCloudflareUploadByUrl($url: String!) {
    createCloudflareUploadByUrl(url: $url) {
      id
    }
  }
`)

// Helper function to process images
async function processImage(image: JourneySimpleImage) {
  let src = image.src
  let blurhash = image.blurhash ?? ''
  let width = image.width ?? 1
  let height = image.height ?? 1

  // Only upload if src is not already valid
  if (!isValidImageUrl(src)) {
    const { data } = await apollo.mutate({
      mutation: CREATE_CLOUDFLARE_IMAGE,
      variables: { url: src }
    })

    const imageId = data?.createCloudflareUploadByUrl?.id
    if (imageId != null) {
      src = `https://imagedelivery.net/${
        process.env.CLOUDFLARE_UPLOAD_KEY ?? ''
      }/${imageId}/public`

      // Generate blurhash for the uploaded image
      const blurhashData = await generateBlurhashAndMetadataFromUrl(src)
      blurhash = blurhashData.blurhash
      width = blurhashData.width
      height = blurhashData.height
    }
  }

  return {
    src,
    blurhash,
    width,
    height,
    alt: image.alt
  }
}

function extractYouTubeVideoId(url: string): string | null {
  // If url is already an 11-char video ID, return as-is
  if (/^[\w-]{11}$/.test(url)) return url
  // Otherwise, try to extract from url
  const match = url.match(
    /(?:v=|vi=|youtu\.be\/|\/v\/|embed\/|shorts\/|\/watch\?v=|\/watch\?.+&v=)([\w-]{11})/
  )
  if (match) return match[1]
  // Fallback: try generic 11-char match
  const generic = url.match(/([\w-]{11})/)
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
  const isoDuration = data.items?.[0]?.contentDetails?.duration
  if (!isoDuration) throw new Error('Could not fetch video duration')
  return parseISO8601Duration(isoDuration)
}

export async function updateSimpleJourney(
  journeyId: string,
  simple: JourneySimpleUpdate
) {
  return prisma.$transaction(async (tx) => {
    const processedBackgroundImages = new Map()
    const processedCardImages = new Map()

    for (const card of simple.cards) {
      if (card.backgroundImage != null) {
        processedBackgroundImages.set(
          card.id,
          await processImage(card.backgroundImage)
        )
      }

      if (card.image != null) {
        processedCardImages.set(card.id, await processImage(card.image))
      }
    }

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

    // 1. Create StepBlocks and CardBlocks
    for (const [i, simpleCard] of simple.cards.entries()) {
      const stepBlock = await tx.block.create({
        data: {
          journeyId,
          typename: 'StepBlock',
          parentOrder: i,
          x: simpleCard.x ?? 0,
          y: simpleCard.y ?? 0
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

      if (card.video != null) {
        const nextStepBlock =
          card.defaultNextCard != null
            ? stepBlocks.find((s) => s.simpleCardId === card.defaultNextCard)
            : undefined
        const videoId =
          card.video.source === 'youTube'
            ? extractYouTubeVideoId(card.video.src ?? '')
            : card.video.src
        if (videoId == null) {
          throw new Error('Invalid YouTube video URL')
        }
        const videoDuration =
          card.video.source === 'youTube'
            ? await getYouTubeVideoDuration(videoId)
            : card.video.endAt
        await tx.block.create({
          data: {
            journeyId,
            typename: 'VideoBlock',
            parentBlockId: cardBlockId,
            parentOrder: parentOrder++,
            videoId,
            videoVariantLanguageId: '529',
            source: card.video.source,
            autoplay: true,
            startAt: card.video.startAt ?? 0,
            endAt:  videoDuration,
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
          const processedImg = processedCardImages.get(card.id)
          if (processedImg) {
            await tx.block.create({
              data: {
                journeyId,
                typename: 'ImageBlock',
                parentBlockId: cardBlockId,
                parentOrder: parentOrder++,
                src: processedImg.src,
                alt: processedImg.alt,
                width: processedImg.width,
                height: processedImg.height,
                blurhash: processedImg.blurhash
              }
            })
          }
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
          const processedBg = processedBackgroundImages.get(card.id)
          if (processedBg) {
            const bgImage = await tx.block.create({
              data: {
                journeyId,
                typename: 'ImageBlock',
                src: processedBg.src,
                alt: processedBg.alt,
                parentBlockId: cardBlockId,
                width: processedBg.width,
                height: processedBg.height,
                blurhash: processedBg.blurhash
              }
            })
            await tx.block.update({
              where: { id: cardBlockId },
              data: { coverBlockId: bgImage.id }
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
    }
  })
}
