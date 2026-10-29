import { HttpResponse, http } from 'msw'

import { mswServer } from '../../../test/mswServer'

import { fetchYouTube } from './fetchYouTube'

const youTubeVideos = 'https://www.googleapis.com/youtube/v3/videos'
const youTubePlaylists = 'https://www.googleapis.com/youtube/v3/playlists'

describe('fetchYouTube', () => {
  it('reads the resource with the given parameters and the app’s key', async () => {
    let requested: URL | undefined
    mswServer.use(
      http.get(youTubePlaylists, ({ request }) => {
        requested = new URL(request.url)
        return HttpResponse.json({ items: [] })
      })
    )

    await expect(
      fetchYouTube('playlists', { part: 'snippet', id: 'PLabc' })
    ).resolves.toEqual({ items: [] })
    expect(requested?.searchParams.get('part')).toBe('snippet')
    expect(requested?.searchParams.get('id')).toBe('PLabc')
    expect(requested?.searchParams.has('key')).toBe(true)
  })

  it('returns the parsed payload of a success', async () => {
    const payload = { items: [{ kind: 'youtube#video', id: 'abc' }] }
    mswServer.use(http.get(youTubeVideos, () => HttpResponse.json(payload)))

    await expect(fetchYouTube('videos', { id: 'abc' })).resolves.toEqual(
      payload
    )
  })

  it('throws the API’s message when the request is refused', async () => {
    mswServer.use(
      http.get(youTubeVideos, () =>
        HttpResponse.json(
          { error: { code: 403, message: 'The quota has been exceeded.' } },
          { status: 403 }
        )
      )
    )

    await expect(fetchYouTube('videos', { id: 'abc' })).rejects.toThrow(
      'The quota has been exceeded.'
    )
  })

  it('throws a status message when a refusal carries no payload message', async () => {
    mswServer.use(
      http.get(youTubePlaylists, () => HttpResponse.json({}, { status: 500 }))
    )

    await expect(fetchYouTube('playlists', { id: 'PLabc' })).rejects.toThrow(
      'YouTube request failed (500)'
    )
  })
})
