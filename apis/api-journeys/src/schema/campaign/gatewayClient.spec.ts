import { GatewayError } from '../../lib/gateway/graphqlRequest'

import {
  fetchLanguage,
  fetchWatchVideoById,
  fetchWatchVideoBySlug
} from './gatewayClient'

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  })
}

const VIDEO = { id: 'videoId', label: 'featureFilm', childrenCount: 0 }

describe('gatewayClient', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('a gateway failure', () => {
    const failures: Array<[string, () => Promise<Response>]> = [
      [
        'a timeout',
        async () => {
          throw new DOMException('The operation timed out.', 'TimeoutError')
        }
      ],
      [
        'an HTML 502',
        async () =>
          new Response('<html>Bad Gateway</html>', {
            status: 502,
            headers: { 'content-type': 'text/html' }
          })
      ],
      [
        'a gateway error',
        async () =>
          jsonResponse({
            data: null,
            errors: [{ message: 'Failed to fetch from subgraph' }]
          })
      ]
    ]

    it.each(failures)('%s surfaces as the gateway error', async (_, fail) => {
      vi.spyOn(globalThis, 'fetch').mockImplementation(fail)

      await expect(fetchLanguage('529')).rejects.toBeInstanceOf(GatewayError)
      await expect(
        fetchWatchVideoBySlug('jesus/english')
      ).rejects.toMatchObject({ extensions: { code: 'INTERNAL_SERVER_ERROR' } })
      await expect(fetchWatchVideoById('videoId')).rejects.toBeInstanceOf(
        GatewayError
      )
    })
  })

  describe('Watch lookups', () => {
    it('return the video', async () => {
      vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
        jsonResponse({ data: { video: VIDEO } })
      )

      await expect(fetchWatchVideoBySlug('jesus/english')).resolves.toEqual(
        VIDEO
      )
      await expect(fetchWatchVideoById('videoId')).resolves.toEqual(VIDEO)
    })

    it('return null only for an unknown video', async () => {
      vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
        jsonResponse({
          data: null,
          errors: [
            { message: 'Video not found with id slug:nope', path: ['video'] }
          ]
        })
      )

      await expect(fetchWatchVideoBySlug('nope')).resolves.toBeNull()
      await expect(fetchWatchVideoById('nope')).resolves.toBeNull()
    })

    it('rethrow any other error alongside an unknown video', async () => {
      vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
        jsonResponse({
          data: null,
          errors: [
            { message: 'Video not found with id slug:nope', path: ['video'] },
            { message: 'Failed to fetch from subgraph' }
          ]
        })
      )

      await expect(fetchWatchVideoBySlug('nope')).rejects.toBeInstanceOf(
        GatewayError
      )
    })
  })
})
