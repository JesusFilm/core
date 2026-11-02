import type {
  YoutubeVideo,
  YoutubeVideosData
} from '../../components/Editor/Slider/Settings/Drawer/VideoLibrary/VideoFromYouTube/VideoFromYouTube'

/**
 * Read one YouTube video (snippet and duration) from the YouTube Data API,
 * as the journey video library resolves a pasted YouTube link. The
 * API answers an unknown id with no items, so the result can be undefined;
 * it answers a refused request (a bad key, an exhausted quota) with an error
 * payload, which throws the API's message.
 */
export async function fetchYouTubeVideo(
  id: string
): Promise<YoutubeVideo | undefined> {
  const videosQuery = new URLSearchParams({
    part: 'snippet,contentDetails',
    key: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
    id
  }).toString()
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?${videosQuery}`
  )
  const videosData: Partial<YoutubeVideosData> & {
    error?: { message?: string }
  } = await response.json()
  if (!response.ok)
    throw new Error(
      videosData.error?.message ?? `YouTube request failed (${response.status})`
    )
  return videosData.items?.[0] as YoutubeVideo | undefined
}
