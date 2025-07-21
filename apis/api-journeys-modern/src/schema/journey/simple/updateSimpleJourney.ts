import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { graphql } from 'gql.tada'

import { JourneySimpleUpdate } from '@core/shared/ai/journeySimpleTypes'

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

/**
 * Checks if a given image URL is allowed by your remotePatterns.
 * Accepts both http and https, and matches subdomains.
 */
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
        let src = card.image.src
        let blurhash = card.image.blurhash ?? ''
        let width = card.image.width ?? 1
        let height = card.image.height ?? 1

        // Only upload if src is not already valid
        if (!isValidImageUrl(src)) {
          const { data } = await apollo.mutate({
            mutation: CREATE_CLOUDFLARE_IMAGE,
            variables: { url: src }
          })

          const imageId = data?.createCloudflareUploadByUrl.id

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

        // use that source url in the block creation
        await tx.block.create({
          data: {
            journeyId,
            typename: 'ImageBlock',
            parentBlockId: cardBlockId,
            parentOrder: parentOrder++,
            src,
            alt: card.image.alt,
            width,
            height,
            blurhash
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
        let bgSrc = card.backgroundImage.src
        let bgBlurhash = card.backgroundImage.blurhash ?? ''
        let bgWidth = card.backgroundImage.width ?? 1
        let bgHeight = card.backgroundImage.height ?? 1

        // Only upload if bgSrc is not already valid
        if (!isValidImageUrl(bgSrc)) {
          const { data } = await apollo.mutate({
            mutation: CREATE_CLOUDFLARE_IMAGE,
            variables: { url: bgSrc }
          })

          const imageId = data?.createCloudflareUploadByUrl?.id
          if (imageId != null) {
            bgSrc = `https://imagedelivery.net/${
              process.env.CLOUDFLARE_UPLOAD_KEY ?? ''
            }/${imageId}/public`

            // Generate blurhash for the uploaded background image
            const blurhashData = await generateBlurhashAndMetadataFromUrl(bgSrc)
            bgBlurhash = blurhashData.blurhash
            bgWidth = blurhashData.width
            bgHeight = blurhashData.height
          }
        }
        const bgImage = await tx.block.create({
          data: {
            journeyId,
            typename: 'ImageBlock',
            src: bgSrc,
            alt: card.backgroundImage.alt,
            parentBlockId: cardBlockId,
            width: bgWidth,
            height: bgHeight,
            blurhash: bgBlurhash
          }
        })
        await tx.block.update({
          where: { id: cardBlockId },
          data: { coverBlockId: bgImage.id }
        })
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
