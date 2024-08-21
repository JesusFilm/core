import { delay, http } from 'msw'

import { YoutubePlaylist, YoutubeVideo } from './VideoFromYouTube'

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

export const getPlaylistItems = http.get(
  'https://www.googleapis.com/youtube/v3/playlistItems',
  () => {
    return new Response(
      JSON.stringify({
        items: [playlistItem1, playlistItem2, playlistItem3]
      }),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
)

export const getPlaylistItemsEmpty = http.get(
  'https://www.googleapis.com/youtube/v3/playlistItems',
  () => {
    return new Response(
      JSON.stringify({
        items: []
      }),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
)

export const getPlaylistItemsWithOffsetAndUrl = http.get(
  'https://www.googleapis.com/youtube/v3/playlistItems',
  ({ request }) => {
    console.log(request.url)
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const pageToken = url.searchParams.get('pageToken')
    if (id === playlistItem2.contentDetails?.videoId) {
      return new Response(
        JSON.stringify({
          items: [playlistItem2]
        }),
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }
    if (pageToken !== 'nextPageToken') {
      return new Response(
        JSON.stringify({
          items: [playlistItem1, playlistItem2],
          nextPageToken: 'nextPageToken'
        }),
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }
    return new Response(
      JSON.stringify({
        items: [playlistItem3]
      }),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
)

export const getPlaylistItemsLoading = http.get(
  'https://www.googleapis.com/youtube/v3/playlistItems',
  async () => {
    await delay(1000 * 60 * 60 * 60)
    return new Response(
      JSON.stringify({
        items: []
      }),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
)

export const getVideosWithOffsetAndUrl = http.get(
  'https://www.googleapis.com/youtube/v3/videos',
  ({ request }) => {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (id === playlistItem2.contentDetails?.videoId) {
      return new Response(
        JSON.stringify({
          items: [video1]
        }),
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }
    return new Response(
      JSON.stringify({
        items: [video1]
      }),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
)

export const getVideosLoading = http.get(
  'https://www.googleapis.com/youtube/v3/videos',
  async () => {
    await delay(1000 * 60 * 60 * 60)
    return new Response(
      JSON.stringify({
        items: [video1]
      }),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
)
