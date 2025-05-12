import type {
  GetLanguageSlugResponse,
  GetVideoSlugResponse,
  VideoMetadata,
  VideoVariantInput,
  VideoVariantResponse,
  VideoVariantUpdateResponse
} from '../types'

import {
  CREATE_VIDEO_EDITION,
  CREATE_VIDEO_VARIANT,
  UPDATE_VIDEO_VARIANT
} from './gql/mutations'
import { GET_LANGUAGE_SLUG, GET_VIDEO_SLUG } from './gql/queries'
import { getGraphQLClient } from './graphqlClient'

export async function getVideoVariantInput({
  videoId,
  languageId,
  edition,
  muxId,
  playbackId,
  r2PublicUrl,
  metadata
}: {
  videoId: string
  languageId: string
  edition: string
  muxId: string
  playbackId: string
  r2PublicUrl: string
  metadata: VideoMetadata
}): Promise<VideoVariantInput> {
  // Parse source from videoId (e.g., "0_JesusVisionLumo" -> source="0")
  let source: string
  let restOfId: string
  if (videoId.includes('_')) {
    ;[source, restOfId = ''] = videoId.split('_', 2)
    if (restOfId === '') {
      console.warn(
        `[video-importer] Expected an '_' in videoId "${videoId}".` +
          ' The variant id/slug will use the plain videoId which may collide.'
      )
      source = '0'
      restOfId = videoId
    }
  } else {
    source = '0'
    restOfId = videoId
    console.warn(
      `[video-importer] No '_' found in videoId "${videoId}". Using source='0' and restOfId=videoId. The variant id/slug will use the plain videoId which may collide.`
    )
  }
  const client = await getGraphQLClient()

  // Get video slug
  const videoResponse = await client.request<GetVideoSlugResponse>(
    GET_VIDEO_SLUG,
    {
      id: videoId
    }
  )

  if (!videoResponse.video?.slug) {
    throw new Error(`No slug found for video ID: ${videoId}`)
  }

  // Get language slug
  const languageResponse = await client.request<GetLanguageSlugResponse>(
    GET_LANGUAGE_SLUG,
    { id: languageId }
  )

  if (!languageResponse.language?.slug) {
    throw new Error(`No language slug found for language ID: ${languageId}`)
  }

  const slug = `${videoResponse.video.slug}/${languageResponse.language.slug}`

  return {
    id: `${source}_${languageId}_${restOfId}`,
    videoId,
    edition,
    languageId,
    slug,
    downloadable: true,
    published: true,
    muxVideoId: muxId,
    hls: `https://stream.mux.com/${playbackId}.m3u8`,
    share: `http://jesusfilm.org/watch/${slug}`,
    masterUrl: r2PublicUrl,
    masterHeight: metadata.height,
    masterWidth: metadata.width,
    lengthInMilliseconds: metadata.durationMs,
    duration: metadata.duration,
    version: 1
  }
}

export async function updateVideoVariant({
  videoId,
  languageId,
  edition,
  muxId,
  playbackId,
  r2PublicUrl,
  metadata
}: {
  videoId: string
  languageId: string
  edition: string
  muxId: string
  playbackId: string
  r2PublicUrl: string
  metadata: VideoMetadata
}): Promise<void> {
  const client = await getGraphQLClient()
  const input = await getVideoVariantInput({
    videoId,
    languageId,
    edition,
    muxId,
    playbackId,
    r2PublicUrl,
    metadata
  })
  await client.request<VideoVariantUpdateResponse>(UPDATE_VIDEO_VARIANT, {
    input: {
      id: input.id,
      videoId: input.videoId,
      edition: input.edition,
      languageId: input.languageId,
      slug: input.slug,
      downloadable: input.downloadable,
      published: input.published,
      muxVideoId: input.muxVideoId,
      hls: input.hls,
      share: input.share,
      duration: input.duration,
      lengthInMilliseconds: input.lengthInMilliseconds
    }
  })
}

export async function createVideoEdition(
  videoId: string,
  edition: string
): Promise<void> {
  const client = await getGraphQLClient()
  try {
    await client.request(CREATE_VIDEO_EDITION, {
      input: {
        name: edition,
        videoId
      }
    })
    console.log(
      `     [Variant Service] Created edition "${edition}" for video ${videoId}`
    )
  } catch (error) {
    // If edition already exists, we can ignore the error
    const errorMessage = error?.toString() ?? ''
    if (!errorMessage.includes('Unique constraint failed')) {
      throw error
    }
  }
}

export async function createVideoVariant({
  videoId,
  languageId,
  edition,
  muxId,
  playbackId,
  r2PublicUrl,
  metadata
}: {
  videoId: string
  languageId: string
  edition: string
  muxId: string
  playbackId: string
  r2PublicUrl: string
  metadata: VideoMetadata
}): Promise<'created' | 'updated'> {
  const client = await getGraphQLClient()
  const input = await getVideoVariantInput({
    videoId,
    languageId,
    edition,
    muxId,
    playbackId,
    r2PublicUrl,
    metadata
  })

  // First try to update
  try {
    console.log('[Variant Service] Attempting to update existing variant...')
    await updateVideoVariant({
      videoId,
      languageId,
      edition,
      muxId,
      playbackId,
      r2PublicUrl,
      metadata
    })
    return 'updated'
  } catch (error) {
    // If update fails because record doesn't exist, create it
    const errorMessage = error?.toString() ?? ''
    if (errorMessage.includes('Record to update not found')) {
      console.log(
        '[Variant Service] No existing variant found, creating new one...'
      )

      // Create the edition first if it doesn't exist
      await createVideoEdition(videoId, edition)

      const response = await client.request<VideoVariantResponse>(
        CREATE_VIDEO_VARIANT,
        {
          input: {
            id: input.id,
            videoId: input.videoId,
            edition: input.edition,
            languageId: input.languageId,
            slug: input.slug,
            downloadable: input.downloadable,
            published: input.published,
            muxVideoId: input.muxVideoId,
            hls: input.hls,
            share: input.share,
            duration: input.duration,
            lengthInMilliseconds: input.lengthInMilliseconds
          }
        }
      )

      if (!response.videoVariantCreate) {
        throw new Error('Failed to create video variant')
      }

      return 'created'
    }
    throw error
  }
}
