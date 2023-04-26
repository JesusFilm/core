import { rest } from 'msw'
import { YoutubePlaylistItemsData } from './VideoFromYouTube'
import { YoutubeVideosData } from './YouTubeDetails/YouTubeDetails'

type Video = YoutubePlaylistItemsData['items'][number]

const video1: Video = {
  snippet: {
    title: 'What is the Bible?',
    description:
      'This is episode 1 of an ongoing series that explores the origins, content, and purpose of the Bible.',
    thumbnails: {
      default: {
        url: 'https://i.ytimg.com/vi/ak06MSETeo4/default.jpg'
      }
    }
  },
  contentDetails: {
    videoId: 'ak06MSETeo4'
  }
}

const video2: Video = {
  snippet: {
    title: 'Blessing and Curse',
    description:
      'Trace the theme of blessing and curse in the Bible to see how Jesus defeats the curse and restores the blessing of life to creation.',
    thumbnails: {
      default: {
        url: 'https://i.ytimg.com/vi/jQaeIJOA6J0/default.jpg'
      }
    }
  },
  contentDetails: {
    videoId: 'jQaeIJOA6J0'
  }
}

const video3: Video = {
  snippet: {
    title: 'The Story of the Bible',
    description:
      'This video summarizes the overall story of the Bible as a series of crossroad decisions.',
    thumbnails: {
      default: {
        url: 'https://i.ytimg.com/vi/7_CGP-12AE0/default.jpg'
      }
    }
  },
  contentDetails: {
    videoId: '7_CGP-12AE0'
  }
}

export const getVideos = rest.get(
  'https://www.googleapis.com/youtube/v3/playlistItems',
  (_req, res, ctx) => {
    return res(
      ctx.json<YoutubePlaylistItemsData>({
        items: [video1, video2, video3]
      })
    )
  }
)

export const getVideosEmpty = rest.get(
  'https://www.googleapis.com/youtube/v3/playlistItems',
  (_req, res, ctx) => {
    return res(
      ctx.json<YoutubePlaylistItemsData>({
        items: []
      })
    )
  }
)

export const getPlaylistItemsWithOffsetAndUrl = rest.get(
  'https://www.googleapis.com/youtube/v3/playlistItems',
  (req, res, ctx) => {
    if (req.url.searchParams.get('id') === video2.contentDetails?.videoId) {
      return res(
        ctx.json<YoutubePlaylistItemsData>({
          items: [video2]
        })
      )
    }
    if (req.url.searchParams.get('pageToken') !== 'nextPageToken') {
      return res(
        ctx.json<YoutubePlaylistItemsData>({
          items: [video1, video2],
          nextPageToken: 'nextPageToken'
        })
      )
    }
    return res(
      ctx.json<YoutubePlaylistItemsData>({
        items: [video3]
      })
    )
  }
)

export const getPlaylistItemsLoading = rest.get(
  'https://www.googleapis.com/youtube/v3/playlistItems',
  (_req, res, ctx) => {
    return res(
      ctx.delay(1000 * 60 * 60 * 60),
      ctx.json<YoutubePlaylistItemsData>({
        items: []
      })
    )
  }
)

export const getVideosWithOffsetAndUrl = rest.get(
  'https://www.googleapis.com/youtube/v3/videos',
  (req, res, ctx) => {
    if (req.url.searchParams.get('id') === video2.contentDetails?.videoId) {
      return res(
        ctx.json<YoutubeVideosData>({
          items: [
            {
              ...video2,
              id: 'ak06MSETeo4',
              contentDetails: { duration: 'PT6M03S' }
            }
          ]
        })
      )
    }
    if (req.url.searchParams.get('pageToken') !== 'nextPageToken') {
      return res(
        ctx.json<YoutubeVideosData>({
          items: [
            {
              ...video1,
              id: 'ak06MSETeo4',
              contentDetails: { duration: 'PT5M48S' }
            },
            {
              ...video2,
              id: 'ak06MSETeo4',
              contentDetails: { duration: 'PT6M03S' }
            }
          ],
          nextPageToken: 'nextPageToken'
        })
      )
    }
    return res(
      ctx.json<YoutubeVideosData>({
        items: [
          {
            ...video3,
            id: 'ak06MSETeo4',
            contentDetails: { duration: 'PT6M03S' }
          }
        ]
      })
    )
  }
)

export const getVideosLoading = rest.get(
  'https://www.googleapis.com/youtube/v3/videos',
  (_req, res, ctx) => {
    return res(
      ctx.delay(1000 * 60 * 60 * 60),
      ctx.json<YoutubeVideosData>({
        items: []
      })
    )
  }
)
