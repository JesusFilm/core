/** A YouTube video as the Data API's `videos` resource returns it. */
export interface YouTubeVideo {
  kind: 'youtube#video'
  id: string
  snippet: {
    title: string
    description: string
    thumbnails: { default: { url: string }; high: { url: string } }
  }
  contentDetails: {
    duration: string
  }
}

/** A playlist entry as the Data API's `playlistItems` resource returns it. */
export interface YouTubePlaylistItem {
  kind: 'youtube#playlistItem'
  snippet: {
    title: string
    description: string
    thumbnails: { default: { url: string }; high: { url: string } }
  }
  contentDetails: {
    videoId: string
  }
}

/** A page of videos or playlist entries from the Data API. */
export interface YouTubeVideosData {
  items: Array<YouTubeVideo | YouTubePlaylistItem>
  nextPageToken?: string
}

/** The error payload the Data API answers a refused request with. */
interface YouTubeErrorData {
  error?: { message?: string }
}

/**
 * Read one YouTube Data API resource (`videos`, `playlists`) with the given
 * query parameters and the app's key. The API answers a refused request (a
 * bad key, an exhausted quota) with an error payload, which throws the API's
 * message, or a status message when the payload carries none.
 */
export async function fetchYouTube<Data>(
  resource: 'videos' | 'playlists',
  params: Record<string, string>
): Promise<Data> {
  const query = new URLSearchParams({
    ...params,
    key: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? ''
  }).toString()
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/${resource}?${query}`
  )
  const data: Data & YouTubeErrorData = await response.json()
  if (!response.ok)
    throw new Error(
      data.error?.message ?? `YouTube request failed (${response.status})`
    )
  return data
}
