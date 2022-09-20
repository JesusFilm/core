import { rest } from 'msw'
import { YoutubeVideosData } from './VideoFromYouTube'

type Video = YoutubeVideosData['items'][number]

const video1: Video = {
  id: 'ak06MSETeo4',
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
    duration: 'PT5M48S'
  }
}

const video2: Video = {
  id: 'jQaeIJOA6J0',
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
    duration: 'PT6M03S'
  }
}

const video3: Video = {
  id: '7_CGP-12AE0',
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
    duration: 'PT6M03S'
  }
}

export const getVideos = rest.get(
  'https://www.googleapis.com/youtube/v3/videos',
  (_req, res, ctx) => {
    return res(
      ctx.json<YoutubeVideosData>({
        items: [video1, video2, video3]
      })
    )
  }
)

export const getVideosEmpty = rest.get(
  'https://www.googleapis.com/youtube/v3/videos',
  (_req, res, ctx) => {
    return res(
      ctx.json<YoutubeVideosData>({
        items: []
      })
    )
  }
)

export const getVideosWithOffsetAndUrl = rest.get(
  'https://www.googleapis.com/youtube/v3/videos',
  (req, res, ctx) => {
    if (req.url.searchParams.get('id') === video2.id) {
      return res(
        ctx.json<YoutubeVideosData>({
          items: [video2]
        })
      )
    }
    if (req.url.searchParams.get('pageToken') !== 'nextPageToken') {
      return res(
        ctx.json<YoutubeVideosData>({
          items: [video1, video2],
          nextPageToken: 'nextPageToken'
        })
      )
    }
    return res(
      ctx.json<YoutubeVideosData>({
        items: [video3]
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
