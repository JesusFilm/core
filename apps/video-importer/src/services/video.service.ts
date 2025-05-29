import type {
  GetVideoDetailsForVariantUpsertResponse,
  VideoMetadata,
  VideoVariantInput,
  VideoVariantResponse,
  VideoVariantUpdateResponse
} from '../types'

import { CREATE_VIDEO_VARIANT, UPDATE_VIDEO_VARIANT } from './gql/mutations'
import { GET_VIDEO_DETAILS_FOR_VARIANT_UPSERT } from './gql/queries'
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

  const videoDetails =
    await client.request<GetVideoDetailsForVariantUpsertResponse>(
      GET_VIDEO_DETAILS_FOR_VARIANT_UPSERT,
      {
        videoId,
        languageId
      }
    )

  const videoSlug = videoDetails.video.slug
  const languageSlug = videoDetails.language.slug
  const variantId = videoDetails.video.variant?.id
  const variantSlug = videoDetails.video.variant?.slug

  if (!videoSlug) {
    throw new Error(`No slug found for video ID: ${videoId}`)
  }

  if (!languageSlug) {
    throw new Error(`No language slug found for language ID: ${languageId}`)
  }

  const slug = variantSlug ?? `${videoSlug}/${languageSlug}`

  return {
    existingVariantId: variantId ?? null,
    id: variantId ?? `${source}_${languageId}-${restOfId}`,
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
  // Generate all input details first, including the potential client-side composite ID
  const { existingVariantId, ...input } = await getVideoVariantInput({
    videoId,
    languageId,
    edition,
    muxId,
    playbackId,
    r2PublicUrl,
    metadata
  })

  if (existingVariantId) {
    console.log(
      `[Variant Service] Existing variant found for videoId: ${input.videoId} and languageId: ${input.languageId}. DB ID: ${existingVariantId}. Attempting to update...`
    )

    await client.request<VideoVariantUpdateResponse>(UPDATE_VIDEO_VARIANT, {
      input: {
        id: existingVariantId,
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
        lengthInMilliseconds: input.lengthInMilliseconds,
        version: input.version
      }
    })
    return 'updated'
  } else {
    console.log(
      `[Variant Service] No existing variant found for videoId: ${input.videoId} and languageId: ${input.languageId}. Creating new one with ID: ${input.id}...`
    )

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
          lengthInMilliseconds: input.lengthInMilliseconds,
          version: input.version
        }
      }
    )

    if (!response.videoVariantCreate) {
      throw new Error('Failed to create video variant')
    }

    return 'created'
  }
}
