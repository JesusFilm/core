import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  gql
} from '@apollo/client'
import { GraphQLError } from 'graphql'
import { Logger } from 'pino'

import { prisma } from '@core/prisma/media/client'
import type { MuxVideo, VideoVariantUpload } from '@core/prisma/media/client'

import { notifyMediaSlackOfOperationFailure } from '../../lib/slack'
import { jobName as processVideoUploadsJobName } from '../../workers/processVideoUploads/config'
import { queue as processVideoUploadsQueue } from '../../workers/processVideoUploads/queue'
import { createVideoFromUrl, getMaxResolutionValue } from '../mux/video/service'

const FIVE_DAYS = 5 * 24 * 60 * 60

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

  return new ApolloClient({
    link: createHttpLink({
      uri: process.env.GATEWAY_URL,
      headers: {
        'x-graphql-client-name': 'api-media',
        'x-graphql-client-version': process.env.SERVICE_VERSION ?? ''
      }
    }),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: { fetchPolicy: 'no-cache' },
      query: { fetchPolicy: 'no-cache' }
    }
  })
}

async function getLanguageSlug(
  videoSlug: string,
  languageId: string,
  logger?: Logger
): Promise<string> {
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

    return `${videoSlug}/${data.language.slug}`
  } catch (error) {
    logger?.error(
      { error, languageId, videoSlug },
      'Failed to get language slug for variant'
    )
    throw new Error(
      `Failed to create slug for variant: ${error instanceof Error ? error.message : String(error)}`
    )
  } finally {
    if (apollo != null) void apollo.stop()
  }
}

export interface VariantMetadata {
  durationMs: number
  duration: number
  width: number
  height: number
}

export interface CreateVideoVariantInput {
  videoId: string
  edition: string
  languageId: string
  version: number
  muxVideoId: string
  playbackId: string
  metadata: VariantMetadata
  published?: boolean
  uploadId?: string
  logger?: Logger
}

function getVariantId(videoId: string, languageId: string): string {
  const [source, ...restParts] = videoId.split('_')
  const restOfId = restParts.join('_') || videoId
  return `${source}_${languageId}-${restOfId}`
}

export async function createOrUpdateVideoVariant({
  videoId,
  edition,
  languageId,
  version,
  muxVideoId,
  playbackId,
  metadata,
  published = true,
  uploadId,
  logger
}: CreateVideoVariantInput) {
  const variantId = getVariantId(videoId, languageId)
  const muxStreamBaseUrl =
    process.env.MUX_STREAM_BASE_URL || 'https://stream.mux.com/'
  const watchPageBaseUrl =
    process.env.WATCH_PAGE_BASE_URL || 'http://jesusfilm.org/watch/'

  try {
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

    if (videoInfo == null) throw new Error(`Video not found: ${videoId}`)
    if (videoInfo.slug == null)
      throw new Error(`Video slug not found: ${videoId}`)

    const slug =
      existingVariant?.slug ??
      (await getLanguageSlug(videoInfo.slug, languageId, logger))

    const variantData = {
      hls: `${muxStreamBaseUrl}${playbackId}.m3u8`,
      share: `${watchPageBaseUrl}${slug}`,
      duration: metadata.duration,
      lengthInMilliseconds: metadata.durationMs,
      muxVideoId,
      published,
      downloadable: true,
      version
    }

    const variant =
      existingVariant != null
        ? await prisma.videoVariant.update({
            where: { id: existingVariant.id },
            data: variantData
          })
        : await prisma.videoVariant.create({
            data: {
              id: variantId,
              videoId,
              edition,
              languageId,
              slug,
              ...variantData
            }
          })

    if (uploadId != null) {
      await prisma.videoVariantUpload.update({
        where: { id: uploadId },
        data: {
          status: 'variantCreated',
          videoVariantId: variant.id,
          errorMessage: null
        }
      })
    }

    return variant
  } catch (error) {
    if (uploadId != null) {
      await prisma.videoVariantUpload.update({
        where: { id: uploadId },
        data: {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : String(error)
        }
      })
    }
    logger?.error(
      { error, videoId, muxVideoId, variantId, languageId, edition, uploadId },
      'Failed to create video variant'
    )
    throw error
  }
}

export async function queueVideoUploadProcessing(upload: {
  id: string
  videoId: string
  edition: string
  languageId: string
  version: number
  muxVideoId: string | null
  originalFilename: string | null
  durationMs: number | null
  duration: number | null
  width: number | null
  height: number | null
}) {
  if (upload.muxVideoId == null) throw new Error('Upload has no Mux video')
  if (
    upload.durationMs == null ||
    upload.duration == null ||
    upload.width == null ||
    upload.height == null
  ) {
    throw new Error('Upload is missing required metadata')
  }

  await processVideoUploadsQueue.add(
    processVideoUploadsJobName,
    {
      uploadId: upload.id,
      videoId: upload.videoId,
      edition: upload.edition,
      languageId: upload.languageId,
      version: upload.version,
      muxVideoId: upload.muxVideoId,
      metadata: {
        durationMs: upload.durationMs,
        duration: upload.duration,
        width: upload.width,
        height: upload.height
      },
      originalFilename: upload.originalFilename ?? ''
    },
    {
      jobId: `mux:${upload.muxVideoId}`,
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: true,
      removeOnFail: { age: FIVE_DAYS, count: 50 }
    }
  )
}

export async function createMuxVideoForUpload({
  uploadId,
  userId,
  maxResolution,
  downloadable = true
}: {
  uploadId: string
  userId: string
  maxResolution?: string | null
  downloadable?: boolean | null
}): Promise<VideoVariantUpload & { muxVideo: MuxVideo | null }> {
  const upload = await prisma.videoVariantUpload.findUnique({
    where: { id: uploadId },
    include: { r2Asset: true, muxVideo: true }
  })

  if (upload == null) {
    throw new GraphQLError('Video variant upload not found', {
      extensions: { code: 'NOT_FOUND' }
    })
  }

  if (upload.muxVideoId != null) {
    try {
      await queueVideoUploadProcessing(upload)
      return upload
    } catch (error) {
      await prisma.videoVariantUpload.update({
        where: { id: upload.id },
        data: {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : String(error)
        }
      })
      notifyMediaSlackOfOperationFailure({
        operation: 'Video variant upload queue failed',
        error,
        context: {
          uploadId: upload.id,
          videoId: upload.videoId,
          languageId: upload.languageId,
          muxVideoId: upload.muxVideoId,
          userId
        }
      })
      throw error
    }
  }

  if (upload.r2Asset?.publicUrl == null) {
    throw new Error('Upload has no completed R2 public URL')
  }

  try {
    const muxAsset = await createVideoFromUrl(
      upload.r2Asset.publicUrl,
      false,
      getMaxResolutionValue(maxResolution ?? 'uhd'),
      downloadable ?? true
    )

    const muxVideo = await prisma.muxVideo.create({
      data: {
        assetId: muxAsset.id,
        userId,
        name: upload.originalFilename,
        uploadUrl: upload.r2Asset.publicUrl,
        uploadId: upload.r2AssetId,
        downloadable: downloadable ?? true
      }
    })

    const updated = await prisma.videoVariantUpload.update({
      where: { id: upload.id },
      data: {
        status: 'muxCreated',
        muxVideoId: muxVideo.id,
        errorMessage: null
      },
      include: { muxVideo: true }
    })

    await queueVideoUploadProcessing(updated)
    return updated
  } catch (error) {
    await prisma.videoVariantUpload.update({
      where: { id: upload.id },
      data: {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : String(error)
      }
    })
    notifyMediaSlackOfOperationFailure({
      operation: 'Video variant upload Mux create failed',
      error,
      context: {
        uploadId: upload.id,
        videoId: upload.videoId,
        languageId: upload.languageId,
        r2AssetId: upload.r2AssetId,
        userId
      }
    })
    throw error
  }
}

export async function resumeVideoVariantUpload({
  uploadId,
  userId,
  maxResolution,
  downloadable = true
}: {
  uploadId: string
  userId: string
  maxResolution?: string | null
  downloadable?: boolean | null
}) {
  const upload = await prisma.videoVariantUpload.findUnique({
    where: { id: uploadId },
    include: { muxVideo: true }
  })

  if (upload == null) {
    throw new GraphQLError('Video variant upload not found', {
      extensions: { code: 'NOT_FOUND' }
    })
  }

  if (upload.status === 'variantCreated') return upload

  if (upload.status === 'created' || upload.status === 'r2Prepared') {
    throw new Error(
      'This upload cannot be resumed because the browser file upload did not complete. Add this audio language again.'
    )
  }

  if (upload.muxVideoId == null) {
    return await createMuxVideoForUpload({
      uploadId,
      userId,
      maxResolution,
      downloadable
    })
  }

  if (
    upload.muxVideo?.readyToStream === true &&
    upload.muxVideo.playbackId != null
  ) {
    if (
      upload.durationMs == null ||
      upload.duration == null ||
      upload.width == null ||
      upload.height == null
    ) {
      throw new Error('Upload is missing required metadata')
    }

    await createOrUpdateVideoVariant({
      uploadId: upload.id,
      videoId: upload.videoId,
      edition: upload.edition,
      languageId: upload.languageId,
      version: upload.version,
      muxVideoId: upload.muxVideo.id,
      playbackId: upload.muxVideo.playbackId,
      published: upload.published,
      metadata: {
        durationMs: upload.durationMs,
        duration: upload.duration,
        width: upload.width,
        height: upload.height
      }
    })

    return await prisma.videoVariantUpload.findUniqueOrThrow({
      where: { id: upload.id },
      include: { muxVideo: true, videoVariant: true }
    })
  }

  try {
    await prisma.videoVariantUpload.update({
      where: { id: upload.id },
      data: { status: 'muxCreated', errorMessage: null }
    })
    await queueVideoUploadProcessing(upload)

    return await prisma.videoVariantUpload.findUniqueOrThrow({
      where: { id: upload.id },
      include: { muxVideo: true, videoVariant: true }
    })
  } catch (error) {
    await prisma.videoVariantUpload.update({
      where: { id: upload.id },
      data: {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : String(error)
      }
    })
    throw error
  }
}
