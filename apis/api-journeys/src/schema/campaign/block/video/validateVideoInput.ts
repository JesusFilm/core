import { GraphQLError } from 'graphql'

import {
  fetchFieldsFromMux,
  fetchFieldsFromYouTube,
  videoBlockInternalSchema,
  videoBlockMuxSchema,
  videoBlockYouTubeSchema
} from '../../../block/video/service'
import { fetchWatchVideoById } from '../../gatewayClient'
import {
  TEXT_CAPS,
  assertEnum,
  assertLengthOrNull,
  badUserInput,
  parseWithZod,
  truncate
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
    title: truncate(fields.title, TEXT_CAPS.videoTitle),
    description: truncate(fields.description, TEXT_CAPS.videoDescription),
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
    title:
      fields.title == null
        ? null
        : truncate(fields.title, TEXT_CAPS.videoTitle),
    description: null,
    image: 'image' in fields ? fields.image : null,
    duration: 'duration' in fields ? fields.duration : null
  }
}

/**
 * A picked id its service does not know is a bad value, not a missing row:
 * the fetchers' `NOT_FOUND` becomes `BAD_USER_INPUT` / `videoId`. Any other
 * error, such as a YouTube quota or auth failure, passes through.
 */
async function pickedColumns(
  columns: Promise<VideoColumns>,
  message: string
): Promise<VideoColumns> {
  try {
    return await columns
  } catch (error) {
    if (error instanceof GraphQLError && error.extensions.code === 'NOT_FOUND')
      throw badUserInput(message, 'videoId')
    throw error
  }
}

/**
 * A Watch video picked by `videoId`: shape-checked, then resolved through the
 * gateway to a published Watch Video (`BAD_USER_INPUT` / `videoId` if not);
 * `null` when no id is given.
 */
async function resolveWatchVideoId(
  id: string | number | null | undefined
): Promise<string | null> {
  const { videoId } = parseWithZod(
    videoBlockInternalSchema,
    { videoId: optionalId(id) },
    'videoId'
  )
  if (videoId == null) return null
  const video = await fetchWatchVideoById(videoId)
  if (video == null)
    throw badUserInput('videoId is not a published Watch video', 'videoId')
  return video.id
}

/**
 * Pick time, copying the VideoBlock service: `source` is `internal`,
 * `youTube` or `mux` (`BAD_USER_INPUT` / `source`). YouTube and Mux ids are
 * validated by the existing zod schemas (`BAD_USER_INPUT`, field from the
 * first issue path) and their title, description, poster and duration
 * fetched once by the existing fetchers, the text cut to the override caps;
 * an id its service does not know is `BAD_USER_INPUT` / `videoId`.
 * A Watch video is a pasted `url` or a `videoId`, either resolved through
 * the gateway, and stores only its ids, the variant language being the
 * campaign language at link time.
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
      return await pickedColumns(
        youTubeColumns(videoId),
        'videoId must be a valid YouTube videoId'
      )
    }
    case 'mux': {
      const { videoId } = parseWithZod(
        videoBlockMuxSchema,
        { videoId: optionalId(input.videoId) },
        'videoId'
      )
      return await pickedColumns(
        muxColumns(videoId),
        'videoId must be a valid Mux videoId'
      )
    }
    case 'internal': {
      const videoId =
        input.url != null
          ? await resolveWatchUrl(input.url)
          : await resolveWatchVideoId(input.videoId)
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
