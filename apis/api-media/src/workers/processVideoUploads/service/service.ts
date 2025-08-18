import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  gql
} from '@apollo/client'
import { Job } from 'bullmq'
import { Logger } from 'pino'

import { prisma } from '@core/prisma/media/client'

import { getVideo } from '../../../schema/mux/video/service'
import { queue as processVideoDownloadsQueue } from '../../processVideoDownloads/queue'

const GET_LANGUAGE_SLUG = gql`
  query GetLanguageSlug($languageId: ID!) {
    language(id: $languageId) {
      id
      slug
    }
  }
`

function createLanguageClient(): ApolloClient<any> {
  if (!process.env.GATEWAY_URL) {
    throw new Error('GATEWAY_URL environment variable is required')
  }

  const httpLink = createHttpLink({
    uri: process.env.GATEWAY_URL,
    headers: {
      'x-graphql-client-name': 'api-media',
      'x-graphql-client-version': process.env.SERVICE_VERSION ?? ''
    }
  })

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'no-cache'
      },
      query: {
        fetchPolicy: 'no-cache'
      }
    }
  })
}

interface ProcessVideoUploadJobData {
  videoId: string
  edition: string
  languageId: string
  version: number
  muxVideoId: string
  metadata: {
    durationMs: number
    duration: number
    width: number
    height: number
  }
  originalFilename: string
}

export async function service(
  job: Job<ProcessVideoUploadJobData>,
  logger?: Logger
): Promise<void> {
  const { videoId, edition, languageId, version, muxVideoId, metadata } =
    job.data

  logger?.info(
    { videoId, edition, languageId, muxVideoId },
    'Starting video upload processing'
  )

  try {
    const muxVideo = await prisma.muxVideo.findUnique({
      where: { id: muxVideoId }
    })

    if (!muxVideo) {
      logger?.warn({ muxVideoId }, 'Mux video not found')
      return
    }

    if (!muxVideo.assetId) {
      logger?.warn({ muxVideoId }, 'Mux video has no asset ID')
      return
    }

    const { finalStatus, playbackId } = await waitForMuxVideoCompletion(
      muxVideo,
      logger
    )

    if (finalStatus === 'ready' && playbackId) {
      await createVideoVariant({
        videoId,
        edition,
        languageId,
        version,
        muxVideoId,
        playbackId,
        metadata,
        logger
      })
    }

    logger?.info(
      { videoId, muxVideoId, finalStatus },
      'Video upload processing completed'
    )
  } catch (error) {
    logger?.error(
      `Video upload processing failed for video ${videoId} and mux video ${muxVideoId}: ${error as Error}`
    )
    throw error
  }
}

async function waitForMuxVideoCompletion(
  muxVideo: { id: string; assetId: string | null },
  logger?: Logger
): Promise<
  | { finalStatus: 'ready'; playbackId: string }
  | { finalStatus: 'timeout'; playbackId: null }
> {
  const maxAttempts = 480 // 120 minutes (480 * 15 seconds)
  const intervalMs = 15000 // 15 seconds
  let attempts = 0

  if (!muxVideo.assetId) {
    throw new Error(`Mux video ${muxVideo.id} has no assetId`)
  }

  logger?.info(
    { muxVideoId: muxVideo.id, assetId: muxVideo.assetId },
    'Waiting for Mux video to be ready for streaming'
  )

  while (attempts < maxAttempts) {
    try {
      const muxVideoAsset = await getVideo(muxVideo.assetId, false)

      const playbackId = muxVideoAsset?.playback_ids?.[0].id
      if (playbackId != null && muxVideoAsset.status === 'ready') {
        await prisma.muxVideo.update({
          where: { id: muxVideo.id },
          data: {
            playbackId,
            readyToStream: true,
            duration: Math.ceil(muxVideoAsset.duration ?? 0),
            downloadable: true
          }
        })

        // Trigger download processing immediately
        try {
          await processVideoDownloadsQueue.add('process-video-downloads', {
            videoId: muxVideo.id,
            assetId: muxVideo.assetId,
            isUserGenerated: false
          })

          logger?.info(
            { muxVideoId: muxVideo.id, assetId: muxVideo.assetId },
            'Queued download processing job'
          )
        } catch (error) {
          logger?.error(
            { error, muxVideoId: muxVideo.id },
            'Failed to queue download processing - will be handled by GraphQL trigger'
          )
        }

        logger?.info(
          {
            muxVideoId: muxVideo.id,
            assetId: muxVideo.assetId,
            playbackId,
            attempts: attempts + 1
          },
          'Mux video is ready for streaming'
        )
        return {
          finalStatus: 'ready',
          playbackId
        }
      }

      if (attempts % 10 === 0 && attempts > 0) {
        const elapsedMinutes = Math.round((attempts * intervalMs) / 60000)
        // TODO: Remove this log for prod
        logger?.info(
          {
            muxVideoId: muxVideo.id,
            assetId: muxVideo.assetId,
            status: muxVideoAsset.status,
            hasPlaybackId: !!playbackId,
            attempts: attempts + 1,
            elapsedMinutes
          },
          'Still waiting for Mux video to be ready'
        )
      }

      attempts++
      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    } catch (error) {
      logger?.error(
        `Error checking Mux video status for mux video ${muxVideo.id} and asset ${muxVideo.assetId} on attempt ${attempts + 1}: ${error as Error}`
      )
      attempts++
      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }
  }

  logger?.warn(
    {
      muxVideoId: muxVideo.id,
      assetId: muxVideo.assetId,
      maxAttempts,
      totalTimeMinutes: (maxAttempts * intervalMs) / 60000
    },
    'Mux video processing reached maximum attempts without becoming ready'
  )
  return { finalStatus: 'timeout', playbackId: null }
}

async function createVideoVariant({
  videoId,
  edition,
  languageId,
  version,
  muxVideoId,
  playbackId,
  metadata,
  logger
}: {
  videoId: string
  edition: string
  languageId: string
  version: number
  muxVideoId: string
  playbackId: string
  metadata: {
    durationMs: number
    duration: number
    width: number
    height: number
  }
  logger?: Logger
}): Promise<void> {
  // TODO: Remove this log for prod
  logger?.info(
    {
      videoId,
      edition,
      languageId,
      version,
      muxVideoId,
      playbackId,
      metadata
    },
    'Creating video variant'
  )

  const [source, ...restParts] = videoId.split('_')
  const restOfId = restParts.join('_') || videoId
  const variantId = `${source}_${languageId}-${restOfId}`

  const muxStreamBaseUrl =
    process.env.MUX_STREAM_BASE_URL || 'https://stream.mux.com/'
  const watchPageBaseUrl =
    process.env.WATCH_PAGE_BASE_URL || 'http://jesusfilm.org/watch/'

  // First, get video info and check if variant already exists
  const [videoInfo, existingVariant] = await Promise.all([
    prisma.video.findUnique({
      where: { id: videoId },
      select: { slug: true }
    }),
    prisma.videoVariant.findFirst({
      where: {
        OR: [
          { id: variantId },
          {
            videoId,
            languageId,
            edition
          }
        ]
      },
      select: { id: true, slug: true }
    })
  ])

  if (!videoInfo) {
    throw new Error(`Video not found: ${videoId}`)
  }

  let slug: string
  if (existingVariant?.slug) {
    slug = existingVariant.slug
  } else {
    let apollo: ApolloClient<any> | null = null
    try {
      apollo = createLanguageClient()
      const { data } = await apollo.query({
        query: GET_LANGUAGE_SLUG,
        variables: { languageId },
        fetchPolicy: 'no-cache'
      })

      if (!data.language?.slug) {
        throw new Error(`No language slug found for language ID: ${languageId}`)
      }

      slug = `${videoInfo.slug}/${data.language.slug}`
    } catch (error) {
      logger?.error(
        `Failed to get language slug for language ${languageId}: ${error as Error}`
      )
      throw new Error(`Failed to create slug for variant: ${error as Error}`)
    } finally {
      if (apollo) {
        void apollo.stop()
      }
    }
  }

  const hlsUrl = `${muxStreamBaseUrl}${playbackId}.m3u8`
  const shareUrl = `${watchPageBaseUrl}${slug}`

  try {
    if (existingVariant) {
      await prisma.videoVariant.update({
        where: { id: existingVariant.id },
        data: {
          hls: hlsUrl,
          share: shareUrl,
          duration: metadata.duration,
          lengthInMilliseconds: metadata.durationMs,
          muxVideoId,
          published: true,
          downloadable: true,
          version
        }
      })

      // TODO: Remove this log for prod
      logger?.info(
        {
          videoId,
          edition,
          languageId,
          variantId: existingVariant.id,
          muxVideoId,
          playbackId
        },
        'Successfully updated existing video variant'
      )
    } else {
      await prisma.videoVariant.create({
        data: {
          id: variantId,
          videoId,
          edition,
          languageId,
          slug,
          hls: hlsUrl,
          share: shareUrl,
          duration: metadata.duration,
          lengthInMilliseconds: metadata.durationMs,
          muxVideoId,
          published: true,
          downloadable: true,
          version
        }
      })

      // TODO: Remove this log for prod
      logger?.info(
        {
          videoId,
          edition,
          languageId,
          variantId,
          muxVideoId,
          playbackId
        },
        'Successfully created new video variant'
      )
    }
  } catch (error) {
    logger?.error(
      `Failed to create video variant for video ${videoId} and mux video ${muxVideoId}: ${error as Error}`
    )
    throw error
  }
}
