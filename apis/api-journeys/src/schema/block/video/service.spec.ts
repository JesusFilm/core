import { vi } from 'vitest'

import {
  fetchFieldsFromMux,
  fetchFieldsFromYouTube,
  videoBlockInternalSchema,
  videoBlockMuxSchema,
  videoBlockYouTubeSchema
} from './service'

// Mock @apollo/client used by fetchFieldsFromMux
const mockQuery = vi.fn()
vi.mock('@apollo/client', () => {
  return {
    ApolloClient: vi.fn().mockImplementation(() => ({ query: mockQuery })),
    InMemoryCache: vi.fn(),
    createHttpLink: vi.fn()
  }
})

describe('video service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('schemas', () => {
    it('validates YouTube schema with 11-char id', () => {
      expect(() =>
        videoBlockYouTubeSchema.parse({ videoId: 'ABCDEFGHIJK' })
      ).not.toThrow()
    })

    it('fails YouTube schema with invalid id', () => {
      expect(() =>
        videoBlockYouTubeSchema.parse({ videoId: 'short' })
      ).toThrow()
    })

    it('validates internal schema with nullish fields', () => {
      expect(() =>
        videoBlockInternalSchema.parse({
          videoId: null,
          videoVariantLanguageId: undefined
        })
      ).not.toThrow()
    })

    it('validates mux schema with non-empty id and fails for empty', () => {
      expect(() =>
        videoBlockMuxSchema.parse({ videoId: 'mux123' })
      ).not.toThrow()
      expect(() => videoBlockMuxSchema.parse({ videoId: '' })).toThrow()
    })
  })

  describe('fetchFieldsFromMux', () => {
    it('throws NOT_FOUND when mux video missing', async () => {
      mockQuery.mockResolvedValue({ data: { getMuxVideo: null } })

      await expect(fetchFieldsFromMux('mux-id')).rejects.toMatchObject({
        message: 'videoId cannot be found on Mux'
      })
    })

    it('returns only title when playbackId is null', async () => {
      mockQuery.mockResolvedValue({
        data: {
          getMuxVideo: { id: 'mux-id', name: 'Mux Title', playbackId: null }
        }
      })

      await expect(fetchFieldsFromMux('mux-id')).resolves.toEqual({
        title: 'Mux Title'
      })
    })

    it('returns title, image, duration, endAt when playbackId present', async () => {
      mockQuery.mockResolvedValue({
        data: {
          getMuxVideo: {
            id: 'mux-id',
            name: 'Mux Title',
            playbackId: 'play123',
            duration: 12.7
          }
        }
      })

      await expect(fetchFieldsFromMux('mux-id')).resolves.toEqual({
        title: 'Mux Title',
        image: 'https://image.mux.com/play123/thumbnail.png?time=1',
        duration: 13,
        endAt: 13
      })
    })
  })

  describe('fetchFieldsFromYouTube', () => {
    const globalAny: any = global

    beforeEach(() => {
      globalAny.fetch = vi.fn()
    })

    afterEach(() => {
      delete globalAny.fetch
    })

    it('throws NOT_FOUND when YouTube video missing', async () => {
      globalAny.fetch.mockResolvedValue({
        json: async () => ({ items: [] })
      })

      await expect(fetchFieldsFromYouTube('invalid')).rejects.toMatchObject({
        message: 'videoId cannot be found on YouTube',
        extensions: { code: 'NOT_FOUND' }
      })
    })

    it('throws a non-NOT_FOUND error when YouTube returns an error body', async () => {
      // quota exceeded / invalid API key must not read as "video missing"
      globalAny.fetch.mockResolvedValue({
        json: async () => ({ error: { code: 403, message: 'quotaExceeded' } })
      })

      await expect(fetchFieldsFromYouTube('abc')).rejects.toMatchObject({
        message: 'YouTube API request failed: quotaExceeded',
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      })
    })

    it.each([
      { duration: 'PT3M45S', expected: 225 },
      { duration: 'PT1H30M', expected: 5400 },
      { duration: 'PT45S', expected: 45 },
      { duration: 'PT2H', expected: 7200 },
      { duration: 'PT10M', expected: 600 }
    ])(
      'parses ISO8601 duration $duration as $expected seconds',
      async ({ duration, expected }) => {
        globalAny.fetch.mockResolvedValue({
          json: async () => ({
            items: [
              {
                id: 'abc',
                snippet: {
                  title: 'YT Title',
                  description: 'YT Desc',
                  thumbnails: { high: { url: 'img-url' } }
                },
                contentDetails: { duration }
              }
            ]
          })
        })

        await expect(fetchFieldsFromYouTube('abc')).resolves.toMatchObject({
          duration: expected
        })
      }
    )

    it('returns fields and parses ISO8601 duration', async () => {
      globalAny.fetch.mockResolvedValue({
        json: async () => ({
          items: [
            {
              id: 'abc',
              snippet: {
                title: 'YT Title',
                description: 'YT Desc',
                thumbnails: { high: { url: 'img-url' } }
              },
              contentDetails: { duration: 'PT1H2M3S' }
            }
          ]
        })
      })

      await expect(fetchFieldsFromYouTube('abc')).resolves.toEqual({
        title: 'YT Title',
        description: 'YT Desc',
        image: 'img-url',
        duration: 3723
      })
    })
  })
})
