import { HttpResponse, http } from 'msw'

import { mswServer } from '../../../test/mswServer'

import { fetchYouTubeVideo } from './fetchYouTubeVideo'

const youTubeVideos = 'https://www.googleapis.com/youtube/v3/videos'

describe('fetchYouTubeVideo', () => {
  it('returns the first item the API answers with', async () => {
    const video = { kind: 'youtube#video', id: 'abc' }
    mswServer.use(
      http.get(youTubeVideos, () => HttpResponse.json({ items: [video] }))
    )

    await expect(fetchYouTubeVideo('abc')).resolves.toEqual(video)
  })

  it('returns undefined for an id the API has no video for', async () => {
    mswServer.use(
      http.get(youTubeVideos, () => HttpResponse.json({ items: [] }))
    )

    await expect(fetchYouTubeVideo('missing')).resolves.toBeUndefined()
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

    await expect(fetchYouTubeVideo('abc')).rejects.toThrow(
      'The quota has been exceeded.'
    )
  })

  it('throws a status message when a refusal carries no payload message', async () => {
    mswServer.use(
      http.get(youTubeVideos, () => HttpResponse.json({}, { status: 500 }))
    )

    await expect(fetchYouTubeVideo('abc')).rejects.toThrow(
      'YouTube request failed (500)'
    )
  })

  it('returns undefined rather than throwing when a success has no items field', async () => {
    mswServer.use(http.get(youTubeVideos, () => HttpResponse.json({})))

    await expect(fetchYouTubeVideo('abc')).resolves.toBeUndefined()
  })
})
