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
 * with no items, so the result can be undefined.
 */
export async function fetchYouTubePlaylist(
  id: string
): Promise<YouTubePlaylist | undefined> {
  const query = new URLSearchParams({
    part: 'snippet,contentDetails',
    key: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
    id
  }).toString()
  const data: YouTubePlaylistsData = await (
    await fetch(`https://www.googleapis.com/youtube/v3/playlists?${query}`)
  ).json()
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
