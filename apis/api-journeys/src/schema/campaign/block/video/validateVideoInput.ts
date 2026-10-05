import {
  fetchFieldsFromMux,
  fetchFieldsFromYouTube,
  videoBlockInternalSchema,
  videoBlockMuxSchema,
  videoBlockYouTubeSchema
} from '../../../block/video/service'
import {
  TEXT_CAPS,
  assertEnum,
  assertLengthOrNull,
  badUserInput,
  parseWithZod
} from '../../validation'

import { resolveWatchUrl } from './watchUrl'

/** The sources a Campaign Video takes (`cloudflare` is a journey-only source). */
export const CAMPAIGN_VIDEO_SOURCES = ['internal', 'youTube', 'mux'] as const
export type CampaignVideoSource = (typeof CAMPAIGN_VIDEO_SOURCES)[number]

export interface VideoPickInput {
  source: string
  videoId?: string | number | null
  url?: string | null
}

export interface VideoColumns {
  source: CampaignVideoSource
  videoId: string
  videoVariantLanguageId: string | null
  title: string | null
  description: string | null
  image: string | null
  duration: number | null
}

/** The source text captured at pick: what a null override falls back to. */
export type VideoSourceText = Pick<VideoColumns, 'title' | 'description'>

function optionalId(
  id: string | number | null | undefined
): string | undefined {
  return id == null ? undefined : String(id)
}

async function youTubeColumns(videoId: string): Promise<VideoColumns> {
  const fields = await fetchFieldsFromYouTube(videoId)
  return {
    source: 'youTube',
    videoId,
    videoVariantLanguageId: null,
    title: fields.title,
    description: fields.description,
    image: fields.image,
    duration: fields.duration
  }
}

async function muxColumns(videoId: string): Promise<VideoColumns> {
  const fields = await fetchFieldsFromMux(videoId)
  return {
    source: 'mux',
    videoId,
    videoVariantLanguageId: null,
    title: fields.title,
    description: null,
    image: 'image' in fields ? fields.image : null,
    duration: 'duration' in fields ? fields.duration : null
  }
}

/**
 * Pick time, copying the VideoBlock service: `source` is `internal`,
 * `youTube` or `mux` (`BAD_USER_INPUT` / `source`). YouTube and Mux ids are
 * validated by the existing zod schemas (`BAD_USER_INPUT`, field from the
 * first issue path) and their title, description, poster and duration
 * fetched once by the existing fetchers. A Watch video is a pasted `url`
 * resolved through the gateway (or a known `videoId`) and stores only its
 * ids, the variant language being the campaign language at link time.
 */
export async function pickVideo(
  input: VideoPickInput,
  campaignLanguageId: string
): Promise<VideoColumns> {
  const source = assertEnum(input.source, 'source', CAMPAIGN_VIDEO_SOURCES)
  if (input.url != null && source !== 'internal')
    throw badUserInput(
      'url is for a Watch link; YouTube and Mux videos take videoId',
      'url'
    )
  switch (source) {
    case 'youTube': {
      const { videoId } = parseWithZod(
        videoBlockYouTubeSchema,
        { videoId: optionalId(input.videoId) },
        'videoId'
      )
      return await youTubeColumns(videoId)
    }
    case 'mux': {
      const { videoId } = parseWithZod(
        videoBlockMuxSchema,
        { videoId: optionalId(input.videoId) },
        'videoId'
      )
      return await muxColumns(videoId)
    }
    case 'internal': {
      const videoId =
        input.url != null
          ? await resolveWatchUrl(input.url)
          : parseWithZod(
              videoBlockInternalSchema,
              { videoId: optionalId(input.videoId) },
              'videoId'
            ).videoId
      if (videoId == null)
        throw badUserInput('a Watch video needs its url', 'url')
      return {
        source,
        videoId,
        videoVariantLanguageId: campaignLanguageId,
        title: null,
        description: null,
        image: null,
        duration: null
      }
    }
  }
}

/**
 * Re-read the source text of a YouTube or Mux video, for an override set
 * back to null; a Watch video's source text is read live, so it has none.
 */
export async function fetchVideoSourceText(block: {
  source: string | null
  videoId: string | null
}): Promise<VideoSourceText> {
  if (block.videoId == null) return { title: null, description: null }
  if (block.source === 'youTube') return await youTubeColumns(block.videoId)
  if (block.source === 'mux') return await muxColumns(block.videoId)
  return { title: null, description: null }
}

export interface VideoTextInput {
  title?: string | null
  description?: string | null
}

function overrideOrNull(
  value: string | null,
  field: 'title' | 'description',
  max: number
): string | null {
  const trimmed = assertLengthOrNull(value, field, max)
  return trimmed === '' ? null : trimmed
}

/**
 * The two overrides: `title` ≤ 200 and `description` ≤ 1000, trimmed; empty
 * means no override. Null is kept as null so the caller can fall back to
 * the source text; omitted fields are left out.
 */
export function validateVideoText(input: VideoTextInput): VideoTextInput {
  const data: VideoTextInput = {}
  if (input.title !== undefined)
    data.title = overrideOrNull(input.title, 'title', TEXT_CAPS.videoTitle)
  if (input.description !== undefined)
    data.description = overrideOrNull(
      input.description,
      'description',
      TEXT_CAPS.videoDescription
    )
  return data
}
