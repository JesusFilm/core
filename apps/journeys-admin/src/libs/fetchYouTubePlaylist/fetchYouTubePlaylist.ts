/** A YouTube playlist as the media paste field previews it. */
export interface YouTubePlaylist {
  title: string
  image: string | null
  itemCount: number
}

interface YouTubePlaylistsData {
  error?: { message?: string }
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
  const query = new URLSearchParams({
    part: 'snippet,contentDetails',
    key: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
    id
  }).toString()
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/playlists?${query}`
  )
  const data: YouTubePlaylistsData = await response.json()
  if (!response.ok)
    throw new Error(
      data.error?.message ?? `YouTube request failed (${response.status})`
    )
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
