import { HttpResponse, http } from 'msw'

import { mswServer } from '../../../test/mswServer'

import { fetchYouTubePlaylist } from './fetchYouTubePlaylist'

const youTubePlaylists = 'https://www.googleapis.com/youtube/v3/playlists'

describe('fetchYouTubePlaylist', () => {
  it('returns the first item the API answers with as a playlist', async () => {
    mswServer.use(
      http.get(youTubePlaylists, () =>
        HttpResponse.json({
          items: [
            {
              snippet: {
                title: 'Playlist title',
                thumbnails: {
                  high: { url: 'https://i.ytimg.com/high.jpg' },
                  default: { url: 'https://i.ytimg.com/default.jpg' }
                }
              },
              contentDetails: { itemCount: 12 }
            }
          ]
        })
      )
    )

    await expect(fetchYouTubePlaylist('PLabc')).resolves.toEqual({
      title: 'Playlist title',
      image: 'https://i.ytimg.com/high.jpg',
      itemCount: 12
    })
  })

  it('returns undefined for an id the API has no playlist for', async () => {
    mswServer.use(
      http.get(youTubePlaylists, () => HttpResponse.json({ items: [] }))
    )

    await expect(fetchYouTubePlaylist('missing')).resolves.toBeUndefined()
  })

  it('returns undefined rather than throwing when a success has no items field', async () => {
    mswServer.use(http.get(youTubePlaylists, () => HttpResponse.json({})))

    await expect(fetchYouTubePlaylist('PLabc')).resolves.toBeUndefined()
  })

  it('throws the API’s message when the request is refused', async () => {
    mswServer.use(
      http.get(youTubePlaylists, () =>
        HttpResponse.json(
          { error: { code: 403, message: 'The quota has been exceeded.' } },
          { status: 403 }
        )
      )
    )

    await expect(fetchYouTubePlaylist('PLabc')).rejects.toThrow(
      'The quota has been exceeded.'
    )
  })

  it('throws a status message when a refusal carries no payload message', async () => {
    mswServer.use(
      http.get(youTubePlaylists, () => HttpResponse.json({}, { status: 400 }))
    )

    await expect(fetchYouTubePlaylist('PLabc')).rejects.toThrow(
      'YouTube request failed (400)'
    )
  })
})
