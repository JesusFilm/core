import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { graphql } from 'gql.tada'
import fetch from 'node-fetch'

import { prisma } from '@core/prisma/journeys/client'
import type {
  JourneySimpleAction,
  JourneySimpleImage,
  JourneySimpleUpdate
} from '@core/shared/ai/journeySimpleTypes'

import { env } from '../../../env'
import { generateBlurhashAndMetadataFromUrl } from '../../../utils/generateBlurhashAndMetadataFromUrl'

const ALLOWED_IMAGE_HOSTNAMES = [
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
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:')
      return false
    return ALLOWED_IMAGE_HOSTNAMES.some(
      (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`)
    )
  } catch {
    return false
  }
}

const httpLink = createHttpLink({
  uri: env.GATEWAY_URL,
  headers: {
    'interop-token': env.INTEROP_TOKEN,
    'x-graphql-client-name': 'api-journeys-modern',
    'x-graphql-client-version': env.SERVICE_VERSION
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

interface ProcessedImage {
  src: string
  alt: string
  width: number
  height: number
  blurhash: string
}

async function processImage(image: JourneySimpleImage): Promise<ProcessedImage> {
  let src = image.src
  let blurhash = image.blurhash ?? ''
  let width = image.width ?? 1
  let height = image.height ?? 1

  if (!isValidImageUrl(src)) {
    const { data } = await apollo.mutate({
      mutation: CREATE_CLOUDFLARE_IMAGE,
      variables: { url: src }
    })
    const imageId = data?.createCloudflareUploadByUrl?.id
    if (imageId != null) {
      src = `https://imagedelivery.net/${env.CLOUDFLARE_UPLOAD_KEY}/${imageId}/public`
      const metadata = await generateBlurhashAndMetadataFromUrl(src)
      blurhash = metadata.blurhash
      width = metadata.width
      height = metadata.height
    }
  }

  return { src, blurhash, width, height, alt: image.alt }
}

function extractYouTubeVideoId(url: string): string | null {
  if (/^[\w-]{11}$/.test(url)) return url
  const match = url.match(
    /(?:v=|vi=|youtu\.be\/|\/v\/|embed\/|shorts\/|\/watch\?v=|\/watch\?.+&v=)([\w-]{11})/
  )
  if (match) return match[1]
  const generic = url.match(/([\w-]{11})/)
  return generic ? generic[1] : null
}

function parseISO8601Duration(duration: string): number {
  const match = duration.match(
    /P(\d+Y)?(\d+W)?(\d+D)?T(\d+H)?(\d+M)?(\d+S)?/
  )
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

async function getYouTubeVideoDuration(videoId: string): Promise<number> {
  const videosQuery = new URLSearchParams({
    part: 'contentDetails',
    key: env.FIREBASE_API_KEY,
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

type StepBlockMap = Array<{
  stepBlockId: string
  cardBlockId: string
  simpleCardId: string
}>

/** Map a JourneySimpleAction to Prisma action create data */
function mapAction(
  action: JourneySimpleAction,
  stepBlocks: StepBlockMap
): Record<string, unknown> | undefined {
  switch (action.kind) {
    case 'navigate': {
      const target = stepBlocks.find(
        (s) => s.simpleCardId === action.cardId
      )
      return target ? { create: { blockId: target.stepBlockId } } : undefined
    }
    case 'url':
      return { create: { url: action.url } }
    case 'email':
      return { create: { email: action.email } }
    case 'chat':
      return { create: { chatUrl: action.chatUrl } }
    case 'phone':
      return {
        create: {
          phone: action.phone,
          ...(action.countryCode ? { countryCode: action.countryCode } : {}),
          ...(action.contactAction
            ? { contactAction: action.contactAction }
            : {})
        }
      }
  }
}

export async function updateSimpleJourney(
  journeyId: string,
  simple: JourneySimpleUpdate
): Promise<void> {
  // --- PHASE 1: Pre-process all images and videos OUTSIDE the transaction ---
  const processedImages = new Map<string, ProcessedImage>()
  const processedBgImages = new Map<string, ProcessedImage>()
  const videoMetadata = new Map<string, number>() // cardId → duration

  for (const card of simple.cards) {
    // Content images
    for (const block of card.content) {
      if (block.type === 'image') {
        const key = `${card.id}:${block.src}`
        if (!processedImages.has(key)) {
          processedImages.set(
            key,
            await processImage({ src: block.src, alt: block.alt })
          )
        }
      }
      if (block.type === 'video') {
        const videoId = extractYouTubeVideoId(block.url)
        if (videoId) {
          const duration = await getYouTubeVideoDuration(videoId)
          videoMetadata.set(`${card.id}:${block.url}`, duration)
        }
      }
    }
    // Background image
    if (card.backgroundImage) {
      processedBgImages.set(card.id, await processImage(card.backgroundImage))
    }
    // Background video
    if (card.backgroundVideo) {
      const videoId = extractYouTubeVideoId(card.backgroundVideo.url)
      if (videoId) {
        const duration = await getYouTubeVideoDuration(videoId)
        videoMetadata.set(`bg:${card.id}`, duration)
      }
    }
  }

  // --- PHASE 2: Transaction — only DB writes ---
  await prisma.$transaction(async (tx) => {
    // Soft-delete all existing blocks
    await tx.block.updateMany({
      where: { journeyId, deletedAt: null },
      data: { deletedAt: new Date().toISOString() }
    })

    // Update journey title/description
    await tx.journey.update({
      where: { id: journeyId },
      data: { title: simple.title, description: simple.description }
    })

    // Create StepBlocks + CardBlocks
    const stepBlocks: StepBlockMap = []

    for (const [i, card] of simple.cards.entries()) {
      const stepBlock = await tx.block.create({
        data: {
          journeyId,
          typename: 'StepBlock',
          parentOrder: i,
          x: card.x ?? i * 300,
          y: card.y ?? 0
        }
      })

      const cardBlock = await tx.block.create({
        data: {
          journeyId,
          typename: 'CardBlock',
          parentBlockId: stepBlock.id,
          parentOrder: 0,
          ...(card.backgroundColor
            ? { backgroundColor: card.backgroundColor }
            : {})
        }
      })

      stepBlocks.push({
        stepBlockId: stepBlock.id,
        cardBlockId: cardBlock.id,
        simpleCardId: card.id
      })
    }

    // Create content blocks for each card
    for (const card of simple.cards) {
      const entry = stepBlocks.find((s) => s.simpleCardId === card.id)
      if (!entry) continue
      const { stepBlockId, cardBlockId } = entry

      // Content blocks
      for (const [blockIndex, block] of card.content.entries()) {
        switch (block.type) {
          case 'heading':
            await tx.block.create({
              data: {
                journeyId,
                typename: 'TypographyBlock',
                parentBlockId: cardBlockId,
                parentOrder: blockIndex,
                content: block.text,
                variant: block.variant ?? 'h3'
              }
            })
            break

          case 'text':
            await tx.block.create({
              data: {
                journeyId,
                typename: 'TypographyBlock',
                parentBlockId: cardBlockId,
                parentOrder: blockIndex,
                content: block.text,
                variant: block.variant ?? 'body1'
              }
            })
            break

          case 'button':
            await tx.block.create({
              data: {
                journeyId,
                typename: 'ButtonBlock',
                parentBlockId: cardBlockId,
                parentOrder: blockIndex,
                label: block.text,
                action: mapAction(block.action, stepBlocks)
              }
            })
            break

          case 'image': {
            const key = `${card.id}:${block.src}`
            const processed = processedImages.get(key)
            await tx.block.create({
              data: {
                journeyId,
                typename: 'ImageBlock',
                parentBlockId: cardBlockId,
                parentOrder: blockIndex,
                src: processed?.src ?? block.src,
                alt: block.alt,
                width: processed?.width ?? block.width ?? 1,
                height: processed?.height ?? block.height ?? 1,
                blurhash: processed?.blurhash ?? block.blurhash ?? ''
              }
            })
            break
          }

          case 'video': {
            const videoId = extractYouTubeVideoId(block.url)
            if (!videoId) throw new Error('Invalid YouTube video URL')
            const duration =
              videoMetadata.get(`${card.id}:${block.url}`) ?? 0
            await tx.block.create({
              data: {
                journeyId,
                typename: 'VideoBlock',
                parentBlockId: cardBlockId,
                parentOrder: blockIndex,
                videoId,
                source: 'youTube',
                autoplay: true,
                startAt: block.startAt ?? 0,
                endAt: block.endAt ?? duration
              }
            })
            break
          }

          case 'poll': {
            const radioQuestion = await tx.block.create({
              data: {
                journeyId,
                typename: 'RadioQuestionBlock',
                parentBlockId: cardBlockId,
                parentOrder: blockIndex,
                ...(block.gridView === true ? { gridView: true } : {})
              }
            })
            for (const [j, option] of block.options.entries()) {
              await tx.block.create({
                data: {
                  journeyId,
                  typename: 'RadioOptionBlock',
                  parentBlockId: radioQuestion.id,
                  parentOrder: j,
                  label: option.text,
                  action: mapAction(option.action, stepBlocks)
                }
              })
            }
            break
          }

          case 'multiselect': {
            const multiselectBlock = await tx.block.create({
              data: {
                journeyId,
                typename: 'MultiselectBlock',
                parentBlockId: cardBlockId,
                parentOrder: blockIndex,
                ...(block.min != null ? { min: block.min } : {}),
                ...(block.max != null ? { max: block.max } : {})
              }
            })
            for (const [j, optionText] of block.options.entries()) {
              await tx.block.create({
                data: {
                  journeyId,
                  typename: 'MultiselectOptionBlock',
                  parentBlockId: multiselectBlock.id,
                  parentOrder: j,
                  label: optionText
                }
              })
            }
            break
          }

          case 'textInput':
            await tx.block.create({
              data: {
                journeyId,
                typename: 'TextResponseBlock',
                parentBlockId: cardBlockId,
                parentOrder: blockIndex,
                label: block.label,
                type: block.inputType ?? 'freeForm',
                ...(block.placeholder
                  ? { placeholder: block.placeholder }
                  : {}),
                ...(block.hint ? { hint: block.hint } : {}),
                ...(block.required === true ? { required: true } : {})
              }
            })
            break

          case 'spacer':
            await tx.block.create({
              data: {
                journeyId,
                typename: 'SpacerBlock',
                parentBlockId: cardBlockId,
                parentOrder: blockIndex,
                spacing: block.spacing
              }
            })
            break
        }
      }

      // Background image (cover block)
      if (card.backgroundImage) {
        const processed = processedBgImages.get(card.id)
        if (processed) {
          const bgImageBlock = await tx.block.create({
            data: {
              journeyId,
              typename: 'ImageBlock',
              parentBlockId: cardBlockId,
              src: processed.src,
              alt: processed.alt,
              width: processed.width,
              height: processed.height,
              blurhash: processed.blurhash
            }
          })
          await tx.block.update({
            where: { id: cardBlockId },
            data: { coverBlockId: bgImageBlock.id }
          })
        }
      }

      // Background video (cover block)
      if (card.backgroundVideo) {
        const videoId = extractYouTubeVideoId(card.backgroundVideo.url)
        if (videoId) {
          const duration = videoMetadata.get(`bg:${card.id}`) ?? 0
          const bgVideoBlock = await tx.block.create({
            data: {
              journeyId,
              typename: 'VideoBlock',
              parentBlockId: cardBlockId,
              videoId,
              source: 'youTube',
              autoplay: true,
              startAt: card.backgroundVideo.startAt ?? 0,
              endAt: card.backgroundVideo.endAt ?? duration
            }
          })
          await tx.block.update({
            where: { id: cardBlockId },
            data: { coverBlockId: bgVideoBlock.id }
          })
        }
      }

      // Default next card (StepBlock.nextBlockId)
      if (card.defaultNextCard) {
        const nextEntry = stepBlocks.find(
          (s) => s.simpleCardId === card.defaultNextCard
        )
        if (nextEntry) {
          await tx.block.update({
            where: { id: stepBlockId },
            data: { nextBlockId: nextEntry.stepBlockId }
          })
        }
      }
    }
  })
}
