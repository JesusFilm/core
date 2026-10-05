import type {
  YoutubeVideo,
  YoutubeVideosData
} from '../../components/Editor/Slider/Settings/Drawer/VideoLibrary/VideoFromYouTube/VideoFromYouTube'

/**
 * Read one YouTube video (snippet and duration) from the YouTube Data API,
 * as the journey video library resolves a pasted YouTube link. The
 * API answers an unknown id with no items, so the result can be undefined.
 */
export async function fetchYouTubeVideo(
  id: string
): Promise<YoutubeVideo | undefined> {
  const videosQuery = new URLSearchParams({
    part: 'snippet,contentDetails',
    key: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
    id
  }).toString()
  const videosData: YoutubeVideosData = await (
    await fetch(`https://www.googleapis.com/youtube/v3/videos?${videosQuery}`)
  ).json()
  return videosData.items[0] as YoutubeVideo | undefined
}
