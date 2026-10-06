import { GraphQLError } from 'graphql'

import { env } from '../../../../env'
import {
  YoutubeVideosData,
  parseISO8601Duration
} from '../../../block/video/service'
import { badUserInput } from '../../validation'

/** A playlist import brings in this many videos; the author pastes more one by one. */
export const PLAYLIST_IMPORT_LIMIT = 12

export const PLAYLIST_URL_ERROR = "That link isn't a YouTube playlist"

const YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com']
const PLAYLIST_ID = /^[\w-]{10,}$/

/**
 * A YouTube playlist address is `https://(www|m.)youtube.com/playlist?list=<id>`;
 * its playlist id, or `null` for anything else (a video link that also
 * carries `list=` is a video, not a playlist).
 */
export function parsePlaylistUrl(url: string): string | null {
  let parsed: URL
  try {
    parsed = new URL(url.trim())
  } catch {
    return null
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null
  if (!YOUTUBE_HOSTS.includes(parsed.hostname)) return null
  if (parsed.pathname.replace(/\/$/, '') !== '/playlist') return null
  const id = parsed.searchParams.get('list')
  return id != null && PLAYLIST_ID.test(id) ? id : null
}

export interface YouTubePlaylistVideo {
  videoId: string
  title: string
  description: string
  image: string
  duration: number
}

interface YoutubePlaylistItemsData {
  error?: { code: number; message: string }
  items?: Array<{ contentDetails: { videoId: string } }>
}

function youTubeError(error: { code: number; message: string }): GraphQLError {
  if (error.code === 404)
    return new GraphQLError('playlist cannot be found on YouTube', {
      extensions: { code: 'NOT_FOUND' }
    })
  // quota/auth failures must not read as "playlist does not exist"
  return new GraphQLError(`YouTube API request failed: ${error.message}`, {
    extensions: { code: 'INTERNAL_SERVER_ERROR' }
  })
}

async function youTubeRequest<T>(
  resource: 'playlistItems' | 'videos',
  params: Record<string, string>
): Promise<T> {
  const query = new URLSearchParams({
    ...params,
    key: env.FIREBASE_API_KEY
  }).toString()
  return (await (
    await fetch(`https://www.googleapis.com/youtube/v3/${resource}?${query}`)
  ).json()) as T
}

/**
 * The first `PLAYLIST_IMPORT_LIMIT` videos of a playlist in playlist order,
 * with the fields `fetchFieldsFromYouTube` captures for one video, in two
 * Data API requests (the playlist's items, then their videos). Private or
 * deleted entries, which the videos request omits, are skipped.
 */
export async function fetchYouTubePlaylistVideos(
  playlistId: string
): Promise<YouTubePlaylistVideo[]> {
  const playlist = await youTubeRequest<YoutubePlaylistItemsData>(
    'playlistItems',
    {
      part: 'contentDetails',
      playlistId,
      maxResults: String(PLAYLIST_IMPORT_LIMIT)
    }
  )
  if (playlist.error != null) throw youTubeError(playlist.error)
  const videoIds = (playlist.items ?? [])
    .map((item) => item.contentDetails.videoId)
    .slice(0, PLAYLIST_IMPORT_LIMIT)
  if (videoIds.length === 0)
    throw badUserInput('That playlist has no videos', 'url')

  const videos = await youTubeRequest<YoutubeVideosData>('videos', {
    part: 'snippet,contentDetails',
    id: videoIds.join(',')
  })
  if (videos.error != null) throw youTubeError(videos.error)
  const byId = new Map((videos.items ?? []).map((item) => [item.id, item]))
  return videoIds.flatMap((videoId) => {
    const video = byId.get(videoId)
    if (video == null) return []
    return [
      {
        videoId,
        title: video.snippet.title,
        description: video.snippet.description,
        image: video.snippet.thumbnails.high.url,
        duration: parseISO8601Duration(video.contentDetails.duration)
      }
    ]
  })
}
