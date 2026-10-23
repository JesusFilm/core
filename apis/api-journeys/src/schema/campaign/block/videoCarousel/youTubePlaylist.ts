import { GraphQLError } from 'graphql'

import {
  YouTubeApiError,
  YoutubeVideosData,
  youTubeRequest
} from '../../../../lib/youTube/youTubeRequest'
import { parseISO8601Duration } from '../../../block/video/service'
import { badUserInput } from '../../errors'
import { TEXT_CAPS, truncate } from '../../validation'

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
  error?: YouTubeApiError
  items?: Array<{ contentDetails: { videoId: string } }>
}

function youTubeError(error: YouTubeApiError): GraphQLError {
  if (error.code === 404)
    return badUserInput('playlist cannot be found on YouTube', 'url')
  // quota/auth failures must not read as "playlist does not exist"
  return new GraphQLError(`YouTube API request failed: ${error.message}`, {
    extensions: { code: 'INTERNAL_SERVER_ERROR' }
  })
}

/**
 * The first `PLAYLIST_IMPORT_LIMIT` videos of a playlist in playlist order,
 * with the fields `fetchFieldsFromYouTube` captures for one video, in two
 * Data API requests (the playlist's items, then their videos). Title and
 * description are cut to the Campaign Video override caps. Private or
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
    },
    youTubeError
  )
  const videoIds = (playlist.items ?? [])
    .map((item) => item.contentDetails.videoId)
    .slice(0, PLAYLIST_IMPORT_LIMIT)
  if (videoIds.length === 0)
    throw badUserInput('That playlist has no videos', 'url')

  const videos = await youTubeRequest<YoutubeVideosData>(
    'videos',
    { part: 'snippet,contentDetails', id: videoIds.join(',') },
    youTubeError
  )
  const byId = new Map((videos.items ?? []).map((item) => [item.id, item]))
  return videoIds.flatMap((videoId) => {
    const video = byId.get(videoId)
    if (video == null) return []
    return [
      {
        videoId,
        title: truncate(video.snippet.title, TEXT_CAPS.videoTitle),
        description: truncate(
          video.snippet.description,
          TEXT_CAPS.videoDescription
        ),
        image: video.snippet.thumbnails.high.url,
        duration: parseISO8601Duration(video.contentDetails.duration)
      }
    ]
  })
}
