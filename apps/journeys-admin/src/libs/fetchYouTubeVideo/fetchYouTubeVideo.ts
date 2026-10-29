import { YouTubeVideo, YouTubeVideosData, fetchYouTube } from '../fetchYouTube'

/**
 * Read one YouTube video (snippet and duration) from the YouTube Data API,
 * as the journey video library resolves a pasted YouTube link. The
 * API answers an unknown id with no items, so the result can be undefined;
 * it answers a refused request (a bad key, an exhausted quota) with an error
 * payload, which throws the API's message.
 */
export async function fetchYouTubeVideo(
  id: string
): Promise<YouTubeVideo | undefined> {
  const videosData = await fetchYouTube<Partial<YouTubeVideosData>>('videos', {
    part: 'snippet,contentDetails',
    id
  })
  return videosData.items?.[0] as YouTubeVideo | undefined
}
