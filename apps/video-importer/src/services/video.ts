import { getGraphQLClient } from '../gql/graphqlClient'
import { CREATE_VIDEO_VARIANT, UPDATE_VIDEO_VARIANT } from '../gql/mutations'
import { GET_VIDEO_DETAILS_FOR_VARIANT_UPSERT } from '../gql/queries'
import type {
  GetVideoDetailsForVariantUpsertResponse,
  VideoMetadata,
  VideoVariantInput,
  VideoVariantResponse,
  VideoVariantUpdateResponse
} from '../types'

export async function getVideoVariantInput({
  videoId,
  languageId,
  edition,
  muxId,
  playbackId,
  metadata,
  version
}: {
  videoId: string
  languageId: string
  edition: string
  muxId: string
  playbackId: string
  metadata: VideoMetadata
  version: number
}): Promise<VideoVariantInput> {
  // Parse source from videoId (e.g., "0_JesusVisionLumo" -> source="0" videoId="JesusVisionLumo")
  const [source, ...restParts] = videoId.split('_')
  const restOfId = restParts.join('_') || videoId

  if (
    !videoId.includes('_') ||
    (videoId.includes('_') && restParts.join('_') === '')
  ) {
    console.warn(
      `[video-importer] No '_' found in videoId "${videoId}" or missing content after '_'. Using source='${source}' and restOfId='${restOfId}'. The variant id/slug may collide.`
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

  if (!videoDetails.video) {
    throw new Error(`No video found for ID: ${videoId}`)
  }

  if (!videoDetails.language) {
    throw new Error(`No language found for ID: ${languageId}`)
  }

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

  const muxStreamBaseUrl =
    process.env.MUX_STREAM_BASE_URL || 'https://stream.mux.com/'
  const watchPageBaseUrl =
    process.env.WATCH_PAGE_BASE_URL || 'http://jesusfilm.org/watch/'

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
    hls: `${muxStreamBaseUrl}${playbackId}.m3u8`,
    share: `${watchPageBaseUrl}${slug}`,
    lengthInMilliseconds: metadata.durationMs,
    duration: metadata.duration,
    version: version
  }
}

export async function importOrUpdateVideoVariant({
  videoId,
  languageId,
  edition,
  muxId,
  playbackId,
  metadata,
  version
}: {
  videoId: string
  languageId: string
  edition: string
  muxId: string
  playbackId: string
  metadata: VideoMetadata
  version: number
}): Promise<void> {
  const client = await getGraphQLClient()
  const { existingVariantId, ...input } = await getVideoVariantInput({
    videoId,
    languageId,
    edition,
    muxId,
    playbackId,
    metadata,
    version
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
    console.log('   [VideoService] Updated video variant')
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

    console.log('   [VideoService] Created video variant')
  }
}
