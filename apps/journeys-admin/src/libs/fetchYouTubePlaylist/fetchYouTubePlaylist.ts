import { fetchYouTube } from '../fetchYouTube'

/** A YouTube playlist as the media paste field previews it. */
export interface YouTubePlaylist {
  title: string
  image: string | null
  itemCount: number
}

interface YouTubePlaylistsData {
  items?: Array<{
    snippet: {
      title: string
      thumbnails: { high?: { url: string }; default?: { url: string } }
    }
    contentDetails: { itemCount: number }
  }>
}

/**
 * Read one YouTube playlist (title, thumbnail and size) from the YouTube
 * Data API, as `fetchYouTubeVideo` reads a video. An unknown id answers
 * with no items, so the result can be undefined; a refused request (a bad
 * key, an exhausted quota) answers with an error payload, which throws the
 * API's message.
 */
export async function fetchYouTubePlaylist(
  id: string
): Promise<YouTubePlaylist | undefined> {
  const data = await fetchYouTube<YouTubePlaylistsData>('playlists', {
    part: 'snippet,contentDetails',
    id
  })
  const playlist = data.items?.[0]
  if (playlist == null) return undefined
  return {
    title: playlist.snippet.title,
    image:
      playlist.snippet.thumbnails.high?.url ??
      playlist.snippet.thumbnails.default?.url ??
      null,
    itemCount: playlist.contentDetails.itemCount
  }
}
