import { rest } from 'msw'

import {
  YoutubePlaylist,
  YoutubeVideo,
  YoutubeVideosData
} from './VideoFromYouTube'

const playlistItem1: YoutubePlaylist = {
  kind: 'youtube#playlistItem',
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

const playlistItem2: YoutubePlaylist = {
  kind: 'youtube#playlistItem',
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

const playlistItem3: YoutubePlaylist = {
  kind: 'youtube#playlistItem',
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

const video1: YoutubeVideo = {
  kind: 'youtube#video',
  id: 'jQaeIJOA6J0',
  snippet: {
    title: 'Blessing and Curse',
    description:
      'Trace the theme of blessing and curse in the Bible to see how Jesus defeats the curse and restores the blessing of life to creation. ',
    thumbnails: {
      default: {
        url: 'https://i.ytimg.com/vi/jQaeIJOA6J0/default.jpg'
      }
    }
  },
  contentDetails: { duration: 'PT6M03S' }
}

export const getPlaylistItems = rest.get(
  'https://www.googleapis.com/youtube/v3/playlistItems',
  async (_req, res, ctx) => {
    return await res(
      ctx.json<YoutubeVideosData>({
        items: [playlistItem1, playlistItem2, playlistItem3]
      })
    )
  }
)

export const getPlaylistItemsEmpty = rest.get(
  'https://www.googleapis.com/youtube/v3/playlistItems',
  async (_req, res, ctx) => {
    return await res(
      ctx.json<YoutubeVideosData>({
        items: []
      })
    )
  }
)

export const getPlaylistItemsWithOffsetAndUrl = rest.get(
  'https://www.googleapis.com/youtube/v3/playlistItems',
  async (req, res, ctx) => {
    if (
      req.url.searchParams.get('id') === playlistItem2.contentDetails?.videoId
    ) {
      return await res(
        ctx.json<YoutubeVideosData>({
          items: [playlistItem2]
        })
      )
    }
    if (req.url.searchParams.get('pageToken') !== 'nextPageToken') {
      return await res(
        ctx.json<YoutubeVideosData>({
          items: [playlistItem1, playlistItem2],
          nextPageToken: 'nextPageToken'
        })
      )
    }
    return await res(
      ctx.json<YoutubeVideosData>({
        items: [playlistItem3]
      })
    )
  }
)

export const getPlaylistItemsLoading = rest.get(
  'https://www.googleapis.com/youtube/v3/playlistItems',
  async (_req, res, ctx) => {
    return await res(
      ctx.delay(1000 * 60 * 60 * 60),
      ctx.json<YoutubeVideosData>({
        items: []
      })
    )
  }
)

export const getVideosWithOffsetAndUrl = rest.get(
  'https://www.googleapis.com/youtube/v3/videos',
  async (req, res, ctx) => {
    if (
      req.url.searchParams.get('id') === playlistItem2.contentDetails?.videoId
    ) {
      return await res(
        ctx.json<YoutubeVideosData>({
          items: [video1]
        })
      )
    }
    return await res(
      ctx.json<YoutubeVideosData>({
        items: [video1]
      })
    )
  }
)

export const getVideosLoading = rest.get(
  'https://www.googleapis.com/youtube/v3/videos',
  async (_req, res, ctx) => {
    return await res(
      ctx.delay(1000 * 60 * 60 * 60),
      ctx.json<YoutubeVideosData>({
        items: []
      })
    )
  }
)
